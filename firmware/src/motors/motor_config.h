#pragma once

#ifndef TORQUE_MULTIPLIER
#define TORQUE_MULTIPLIER 1.0
#endif

#ifndef HAPTIC_STRENGTH_PRESS
#define HAPTIC_STRENGTH_PRESS 5
#endif

#ifndef HAPTIC_STRENGTH_RELEASE
#define HAPTIC_STRENGTH_RELEASE 1.5
#endif

#if MOTOR_WANZHIDA_ONCE_TOP
#include "motors/wanzhida_once_top.h"
#elif MOTOR_MAD2804
#include "motors/mad2804.h"
#else
#error "No motor configuration specified!"
#endif
