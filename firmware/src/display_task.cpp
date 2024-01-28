#if SK_DISPLAY
#include "display_task.h"
#include "semaphore_guard.h"
#include "util.h"

#include "font/roboto_light_60.h"

static const uint8_t LEDC_CHANNEL_LCD_BACKLIGHT = 0;

DisplayTask::DisplayTask(const uint8_t task_core) : Task{"Display", 2048, 1, task_core} {
  knob_state_queue_ = xQueueCreate(1, sizeof(PB_SmartKnobState));
  assert(knob_state_queue_ != NULL);

  mutex_ = xSemaphoreCreateMutex();
  assert(mutex_ != NULL);
}

DisplayTask::~DisplayTask() {
  vQueueDelete(knob_state_queue_);
  vSemaphoreDelete(mutex_);
}

static void drawPlayButton(TFT_eSprite& spr, int x, int y, int width, int height, uint16_t color) {
  spr.fillTriangle(
    x, y - height / 2,
    x, y + height / 2,
    x + width, y,
    color
  );
}

/**
 * Draws a Pac-man style fan on the given sprite. It is used to draw a radial meter.
*/
static void fillFan(TFT_eSprite& spr, int32_t cx, int32_t cy, int32_t radius, float start_radians, float end_radians, float step_radians, uint16_t color) {
  if (start_radians > end_radians) {
    float tmp = start_radians;
    start_radians = end_radians;
    end_radians = tmp;
  }

  int32_t x1 = cx + cosf(start_radians) * radius;
  int32_t y1 = cy - sinf(start_radians) * radius;
  int32_t x2, y2;

  for (float r = start_radians + step_radians; r < end_radians; r += step_radians) {
    x2 = cx + cosf(r) * radius;
    y2 = cy - sinf(r) * radius;
    spr.fillTriangle(cx, cy, x1, y1, x2, y2, color);
    x1 = x2;
    y1 = y2;
  }

  x2 = cx + cosf(end_radians) * radius;
  y2 = cy - sinf(end_radians) * radius;
  spr.fillTriangle(cx, cy, x1, y1, x2, y2, color);
}

void DisplayTask::run() {
    tft_.begin();
    tft_.invertDisplay(1);
    tft_.setRotation(SK_DISPLAY_ROTATION);
    tft_.fillScreen(TFT_DARKGREEN);

    ledcSetup(LEDC_CHANNEL_LCD_BACKLIGHT, 5000, SK_BACKLIGHT_BIT_DEPTH);
    ledcAttachPin(PIN_LCD_BACKLIGHT, LEDC_CHANNEL_LCD_BACKLIGHT);
    ledcWrite(LEDC_CHANNEL_LCD_BACKLIGHT, (1 << SK_BACKLIGHT_BIT_DEPTH) - 1);

    spr_.setColorDepth(8);

    if (spr_.createSprite(TFT_WIDTH, TFT_HEIGHT) == nullptr) {
      log("ERROR: sprite allocation failed!");
      tft_.fillScreen(TFT_RED);
    } else {
      log("Sprite created!");
      tft_.fillScreen(TFT_PURPLE);
    }
    spr_.setTextColor(0xFFFF, TFT_BLACK);
    
    PB_SmartKnobState state;

    const int RADIUS = TFT_WIDTH / 2;
    const uint16_t DOT_COLOR = spr_.color565(255, 255, 255);

    spr_.setTextDatum(CC_DATUM);
    spr_.setTextColor(TFT_WHITE);
    while(1) {
        if (xQueueReceive(knob_state_queue_, &state, portMAX_DELAY) == pdFALSE) {
          continue;
        }

        spr_.fillSprite(TFT_BLACK);

        int32_t num_positions = state.config.max_position - state.config.min_position + 1;
        float adjusted_sub_position = state.sub_position_unit * state.config.position_width_radians;
        if (num_positions > 0) {
          if (state.current_position == state.config.min_position && state.sub_position_unit < 0) {
            adjusted_sub_position = -logf(1 - state.sub_position_unit  * state.config.position_width_radians / 5 / PI * 180) * 5 * PI / 180;
          } else if (state.current_position == state.config.max_position && state.sub_position_unit > 0) {
            adjusted_sub_position = logf(1 + state.sub_position_unit  * state.config.position_width_radians / 5 / PI * 180)  * 5 * PI / 180;
          }
        }

        float left_bound = PI / 2;
        float right_bound = 0;
        if (num_positions > 0) {
          if (state.config.position_offset_radians < 0.0) {
            // If position_offset_radians is negative, the endpoints are symmetrically placed across the top of the display.
            float range_radians = (state.config.max_position - state.config.min_position) * state.config.position_width_radians;
            left_bound = PI / 2 + range_radians / 2;
            right_bound = PI / 2 - range_radians / 2;
          } else {
            // Otherwise, the endpoints are placed based on the offset origin specified in position_offset_radians.
            float origin = PI / 2 - state.config.position_offset_radians;
            left_bound = origin - state.config.min_position * state.config.position_width_radians;
            right_bound = origin - state.config.max_position * state.config.position_width_radians;
          }
        }
        float raw_angle = left_bound - (state.current_position - state.config.min_position) * state.config.position_width_radians;
        float adjusted_angle = raw_angle - adjusted_sub_position;
        
        bool sk_demo_mode = strncmp(state.config.text, "SKDEMO_", 7) == 0;

        if (!sk_demo_mode) {
          // Draws the meter on the background
          const float background_brightness = 0.75;

          uint8_t r = float(0xff & (state.config.base_color >> 16)) * background_brightness;
          uint8_t g = float(0xff & (state.config.base_color >> 8)) * background_brightness;
          uint8_t b = float(0xff & (state.config.base_color >> 0)) * background_brightness;
          uint16_t meterColor = spr_.color565(r, g, b);
          
          bool has_range = num_positions > 1;

          float t = float(state.current_position - state.config.min_position) / (state.config.max_position - state.config.min_position);

          if (has_range) {
            if (state.config.meter_type == PB_MeterType_VERTICAL) {
              spr_.fillRect(0, TFT_HEIGHT * (1 - t), TFT_WIDTH, TFT_HEIGHT * t, meterColor);
            } else if (state.config.meter_type == PB_MeterType_HORIZONTAL) {
              spr_.fillRect(0, 0, TFT_WIDTH * t, TFT_HEIGHT, meterColor);
            } else if (state.config.meter_type == PB_MeterType_CIRCULAR) {
              int32_t cx = TFT_WIDTH / 2;
              int32_t cy = TFT_HEIGHT / 2;
              spr_.fillCircle(cx, cy, RADIUS * t, meterColor);
            }
          }

          if (state.config.meter_type == PB_MeterType_RADIAL) {
            float origin_angle = has_range ? left_bound : PI / 2;

            while (abs(raw_angle - origin_angle) > PI * 2) {
              if (origin_angle < raw_angle) {
                origin_angle += 2 * PI;
              } else {
                origin_angle -= 2 * PI;
              }
            }

            fillFan(spr_, TFT_WIDTH / 2, TFT_HEIGHT / 2, RADIUS * 2, origin_angle, raw_angle, radians(30), meterColor);
          }

          // Draws a position text
          spr_.setFreeFont(&Roboto_Light_60);

          if (state.config.position_text[0] == '\0') {
            // If no position_text is specified, just draw the number
            spr_.drawNumber(state.current_position, TFT_WIDTH / 2, TFT_HEIGHT / 2 - VALUE_OFFSET, 1);          
          } else {
            // Otherwise, draw the value text while formatting the number
            char buf[10];
            snprintf(buf, sizeof(buf), state.config.position_text, state.current_position);
            spr_.drawString(buf, TFT_WIDTH / 2, TFT_HEIGHT / 2 - VALUE_OFFSET, 1);
          }

          // Draws a description text
          spr_.setFreeFont(&DESCRIPTION_FONT);
          int32_t line_y = TFT_HEIGHT / 2 + DESCRIPTION_Y_OFFSET;
          char* start = state.config.text;
          char* end = start + strlen(state.config.text);
          while (start < end) {
            char* newline = strchr(start, '\n');
            if (newline == nullptr) {
              newline = end;
            }
            
            char buf[sizeof(state.config.text)] = {};
            strncat(buf, start, min(sizeof(buf) - 1, (size_t)(newline - start)));
            spr_.drawString(String(buf), TFT_WIDTH / 2, line_y, 1);
            start = newline + 1;
            line_y += spr_.fontHeight(1);
          }

          // Draws endpoints
          if (num_positions > 0) {
            spr_.drawLine(TFT_WIDTH/2 + RADIUS * cosf(left_bound), TFT_HEIGHT/2 - RADIUS * sinf(left_bound), TFT_WIDTH/2 + (RADIUS - 10) * cosf(left_bound), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(left_bound), TFT_WHITE);
            spr_.drawLine(TFT_WIDTH/2 + RADIUS * cosf(right_bound), TFT_HEIGHT/2 - RADIUS * sinf(right_bound), TFT_WIDTH/2 + (RADIUS - 10) * cosf(right_bound), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(right_bound), TFT_WHITE);
          }
          if (DRAW_ARC) {
            spr_.drawCircle(TFT_WIDTH/2, TFT_HEIGHT/2, RADIUS, TFT_DARKGREY);
          }

          if (num_positions > 0 && ((state.current_position == state.config.min_position && state.sub_position_unit < 0) || (state.current_position == state.config.max_position && state.sub_position_unit > 0))) {
            spr_.fillCircle(TFT_WIDTH/2 + (RADIUS - 10) * cosf(raw_angle), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(raw_angle), 5, DOT_COLOR);
            if (raw_angle < adjusted_angle) {
              for (float r = raw_angle; r <= adjusted_angle; r += 2 * PI / 180) {
                spr_.fillCircle(TFT_WIDTH/2 + (RADIUS - 10) * cosf(r), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(r), 2, DOT_COLOR);
              }
              spr_.fillCircle(TFT_WIDTH/2 + (RADIUS - 10) * cosf(adjusted_angle), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(adjusted_angle), 2, DOT_COLOR);
            } else {
              for (float r = raw_angle; r >= adjusted_angle; r -= 2 * PI / 180) {
                spr_.fillCircle(TFT_WIDTH/2 + (RADIUS - 10) * cosf(r), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(r), 2, DOT_COLOR);
              }
              spr_.fillCircle(TFT_WIDTH/2 + (RADIUS - 10) * cosf(adjusted_angle), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(adjusted_angle), 2, DOT_COLOR);
            }
          } else {
            spr_.fillCircle(TFT_WIDTH/2 + (RADIUS - 10) * cosf(adjusted_angle), TFT_HEIGHT/2 - (RADIUS - 10) * sinf(adjusted_angle), 5, DOT_COLOR);
          }
        } else {
          if (strncmp(state.config.text, "SKDEMO_Scroll", 13) == 0) {
            spr_.fillRect(0, 0, TFT_WIDTH, TFT_HEIGHT, spr_.color565(150, 0, 0));
            spr_.setFreeFont(&Roboto_Thin_24);
            spr_.drawString("Scroll", TFT_WIDTH / 2, TFT_HEIGHT / 2, 1);
            bool detent = false;
            for (uint8_t i = 0; i < state.config.detent_positions_count; i++) {
              if (state.config.detent_positions[i] == state.current_position) {
                detent = true;
                break;
              }
            }
            spr_.fillCircle(TFT_WIDTH/2 + (RADIUS - 16) * cosf(adjusted_angle), TFT_HEIGHT/2 - (RADIUS - 16) * sinf(adjusted_angle), detent ? 8 : 5, TFT_WHITE);
          } else if (strncmp(state.config.text, "SKDEMO_Frames", 13) == 0) {
            int32_t width = (state.current_position - state.config.min_position) * TFT_WIDTH / (state.config.max_position - state.config.min_position);
            spr_.fillRect(0, 0, width, TFT_HEIGHT, spr_.color565(0, 150, 0));
            spr_.setFreeFont(&Roboto_Light_60);
            spr_.drawNumber(state.current_position, TFT_WIDTH / 2, TFT_HEIGHT / 2, 1);
            spr_.setFreeFont(&Roboto_Thin_24);
            spr_.drawString("Frame", TFT_WIDTH / 2, TFT_HEIGHT / 2 - DESCRIPTION_Y_OFFSET - VALUE_OFFSET, 1);
          } else if (strncmp(state.config.text, "SKDEMO_Speed", 12) == 0) {
            spr_.fillRect(0, 0, TFT_WIDTH, TFT_HEIGHT, spr_.color565(0, 0, 150));

            float normalizedFractional = sgn(state.sub_position_unit) *
                CLAMP(lerp(state.sub_position_unit * sgn(state.sub_position_unit), 0.1, 0.9, 0, 1), (float)0, (float)1);
            float normalized = state.current_position + normalizedFractional;
            float speed = sgn(normalized) * powf(2, fabsf(normalized) - 1);
            float roundedSpeed = truncf(speed * 10) / 10;

            spr_.setFreeFont(&Roboto_Thin_24);
            if (roundedSpeed == 0) {
              spr_.drawString("Paused", TFT_WIDTH / 2, TFT_HEIGHT / 2 + DESCRIPTION_Y_OFFSET + VALUE_OFFSET, 1);

              spr_.fillRect(TFT_WIDTH / 2 + 5, TFT_HEIGHT / 2 - 20, 10, 40, TFT_WHITE);
              spr_.fillRect(TFT_WIDTH / 2 - 5 - 10, TFT_HEIGHT / 2 - 20, 10, 40, TFT_WHITE);
            } else {
              char buf[10];
              snprintf(buf, sizeof(buf), "%0.1fx", roundedSpeed);
              spr_.drawString(buf, TFT_WIDTH / 2, TFT_HEIGHT / 2 + DESCRIPTION_Y_OFFSET + VALUE_OFFSET, 1);

              uint16_t x = TFT_WIDTH / 2;
              for (uint8_t i = 0; i < max(1, abs(state.current_position)); i++) {
                drawPlayButton(spr_, x, TFT_HEIGHT / 2, sgn(roundedSpeed) * 20, 40, TFT_WHITE);
                x += sgn(roundedSpeed) * 20;
              }
            }
          }
        }

        spr_.pushSprite(0, 0);

        {
          SemaphoreGuard lock(mutex_);
          ledcWrite(LEDC_CHANNEL_LCD_BACKLIGHT, brightness_);
        }
        delay(5);
    }
}

QueueHandle_t DisplayTask::getKnobStateQueue() {
  return knob_state_queue_;
}

void DisplayTask::setBrightness(uint16_t brightness) {
  SemaphoreGuard lock(mutex_);
  brightness_ = brightness >> (16 - SK_BACKLIGHT_BIT_DEPTH);
}

void DisplayTask::setLogger(Logger* logger) {
    logger_ = logger;
}

void DisplayTask::log(const char* msg) {
    if (logger_ != nullptr) {
        logger_->log(msg);
    }
}

#endif