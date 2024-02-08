import React, {useEffect, useRef, useState} from 'react'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import {PB} from 'smartknobjs-proto'
import {
    Box,
    Button,
    CardActions,
    Paper,
    TextField,
    FormLabel,
    FormControlLabel,
    InputLabel,
    RadioGroup,
    Radio,
    Select,
    Divider,
    MenuItem,
} from '@mui/material'
import {NoUndefinedField} from './util'
import {SmartKnobWebSerial} from 'smartknobjs-webserial'

type Config = NoUndefinedField<PB.ISmartKnobConfig>
type StringConfig = {[P in keyof Config]: string}

const presets: Record<string, Config> = {
    default: {
        position: 0,
        subPositionUnit: 0,
        positionNonce: Math.floor(Math.random() * 255),
        minPosition: 0,
        maxPosition: 20,
        positionWidthRadians: (15 * Math.PI) / 180,
        detentStrengthUnit: 0.5,
        endstopStrengthUnit: 1,
        snapPoint: 0.7,
        text: 'Hello from\nweb serial!',
        detentPositions: [],
        snapPointBias: 0,
        baseColor: 0xffffff,
        positionOffsetRadians: -1,
        positionText: '',
        meterType: PB.MeterType.RADIAL,
        meterCenter: 0,
    },
    angle: {
        position: 0,
        subPositionUnit: 0,
        positionNonce: Math.floor(Math.random() * 255),
        minPosition: 0,
        maxPosition: -1,
        positionWidthRadians: Math.PI / 180,
        detentStrengthUnit: 1,
        endstopStrengthUnit: 1,
        snapPoint: 0.7,
        text: 'deg',
        detentPositions: [],
        snapPointBias: 0,
        baseColor: 0xff0000,
        positionOffsetRadians: Math.PI / 2,
        positionText: '',
        meterType: PB.MeterType.RADIAL,
        meterCenter: 0,
    },
    radius: {
        position: 10,
        subPositionUnit: 0,
        positionNonce: Math.floor(Math.random() * 255),
        minPosition: 0,
        maxPosition: 100,
        positionWidthRadians: (2 * Math.PI) / 180,
        detentStrengthUnit: 0.5,
        endstopStrengthUnit: 1,
        snapPoint: 0.7,
        text: 'px',
        detentPositions: [],
        snapPointBias: 0,
        baseColor: 0x00ff00,
        positionOffsetRadians: -1,
        positionText: '',
        meterType: PB.MeterType.CIRCULAR,
        meterCenter: 0,
    },
    toggle: {
        position: 0,
        subPositionUnit: 0,
        positionNonce: Math.floor(Math.random() * 255),
        minPosition: 0,
        maxPosition: 1,
        positionWidthRadians: (90 * Math.PI) / 180,
        detentStrengthUnit: 0.5,
        endstopStrengthUnit: 1,
        snapPoint: 0.5,
        text: 'Toggle',
        detentPositions: [],
        snapPointBias: 0,
        baseColor: 0x0000ff,
        positionOffsetRadians: -1,
        positionText: '',
        meterType: PB.MeterType.VERTICAL,
        meterCenter: 0,
    },
    slider: {
        position: 0,
        subPositionUnit: 0,
        positionNonce: Math.floor(Math.random() * 255),
        minPosition: -100,
        maxPosition: 100,
        positionWidthRadians: (1 * Math.PI) / 180,
        detentStrengthUnit: 0.5,
        endstopStrengthUnit: 1,
        snapPoint: 0.5,
        text: '%',
        detentPositions: [],
        snapPointBias: 0,
        baseColor: 0xc8ff00,
        positionOffsetRadians: -1,
        positionText: '',
        meterType: PB.MeterType.HORIZONTAL,
        meterCenter: 0,
    },
}

function stringifyConfig(config: Config): StringConfig {
    return Object.fromEntries(
        Object.entries(config).map(([key, value]) => {
            if (key === 'baseColor') {
                return [key, '#' + (value as number).toString(16)]
            } else {
                return [key, String(value)]
            }
        }),
    ) as {
        [P in keyof Config]: string
    }
}

function parseStringConfig(stringConfig: StringConfig): Config {
    return {
        position: parseInt(stringConfig.position) || 0,
        subPositionUnit: parseFloat(stringConfig.subPositionUnit) || 0,
        positionNonce: parseInt(stringConfig.positionNonce) || 0,
        minPosition: parseInt(stringConfig.minPosition) || 0,
        maxPosition: parseInt(stringConfig.maxPosition) || 0,
        positionWidthRadians: parseFloat(stringConfig.positionWidthRadians) || 0,
        detentStrengthUnit: parseFloat(stringConfig.detentStrengthUnit) || 0,
        endstopStrengthUnit: parseFloat(stringConfig.endstopStrengthUnit) || 0,
        snapPoint: parseFloat(stringConfig.snapPoint) || 0,
        text: stringConfig.text,
        detentPositions: [],
        snapPointBias: parseFloat(stringConfig.snapPointBias) || 0,
        baseColor: parseInt(stringConfig.baseColor.slice(1), 16) || 0xffffff,
        positionOffsetRadians: parseFloat(stringConfig.positionOffsetRadians),
        positionText: stringConfig.positionText,
        meterType: parseInt(stringConfig.meterType) || (PB.MeterType.VERTICAL as PB.MeterType),
        meterCenter: parseFloat(stringConfig.meterCenter) || 0,
    }
}

export type AppProps = object
export const App: React.FC<AppProps> = () => {
    const hasSmartknobInitialized = useRef(false)
    const [smartKnob, setSmartKnob] = useState<SmartKnobWebSerial | null>(null)
    const [smartKnobState, setSmartKnobState] = useState<NoUndefinedField<PB.ISmartKnobState>>(
        PB.SmartKnobState.toObject(PB.SmartKnobState.create({config: PB.SmartKnobConfig.create()}), {
            defaults: true,
        }) as NoUndefinedField<PB.ISmartKnobState>,
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [smartKnobConfig, setSmartKnobConfig] = useState<Config>(presets['default'])
    useEffect(() => {
        console.log('send config', smartKnobConfig)
        smartKnob?.sendConfig(PB.SmartKnobConfig.create(smartKnobConfig))
    }, [
        smartKnob,
        smartKnobConfig.position,
        smartKnobConfig.subPositionUnit,
        smartKnobConfig.positionNonce,
        smartKnobConfig.minPosition,
        smartKnobConfig.maxPosition,
        smartKnobConfig.positionWidthRadians,
        smartKnobConfig.detentStrengthUnit,
        smartKnobConfig.endstopStrengthUnit,
        smartKnobConfig.snapPoint,
        smartKnobConfig.text,
        smartKnobConfig.detentPositions,
        smartKnobConfig.snapPointBias,
    ])
    const [pendingSmartKnobConfig, setPendingSmartKnobConfig] = useState<{[P in keyof Config]: string}>(() =>
        stringifyConfig(presets['default']),
    )

    const connectToSerial = async () => {
        try {
            if (navigator.serial) {
                const serialPort = await navigator.serial.requestPort({
                    filters: SmartKnobWebSerial.USB_DEVICE_FILTERS,
                })
                serialPort.addEventListener('disconnect', () => {
                    setSmartKnob(null)
                })
                const smartKnob = new SmartKnobWebSerial(
                    serialPort,
                    (message) => {
                        if (message.payload === 'smartknobState' && message.smartknobState !== null) {
                            const state = PB.SmartKnobState.create(message.smartknobState)
                            const stateObj = PB.SmartKnobState.toObject(state, {
                                defaults: true,
                            }) as NoUndefinedField<PB.ISmartKnobState>
                            setSmartKnobState(stateObj)
                        } else if (message.payload === 'log' && message.log !== null) {
                            console.log('LOG from smartknob', message.log?.msg)
                        }
                    },
                    {baudRate: 250000},
                )
                setSmartKnob(smartKnob)
                const loop = smartKnob.openAndLoop()
                console.log('FIXME')
                smartKnob.sendConfig(PB.SmartKnobConfig.create(smartKnobConfig))
                hasSmartknobInitialized.current = false
                await loop
            } else {
                console.error('Web Serial API is not supported in this browser.')
                setSmartKnob(null)
            }
        } catch (error) {
            console.error('Error with serial port:', error)
            setSmartKnob(null)
        }
    }

    function applyPreset(basePreset: string) {
        const config = presets[basePreset]
        setPendingSmartKnobConfig(stringifyConfig(config))
        setSmartKnobConfig(config)
        setBasePreset(basePreset)
    }

    const [basePreset, setBasePreset] = useState('default')

    useEffect(() => {
        if (hasSmartknobInitialized.current) {
            const presetNames = Object.keys(presets)
            const currentIndex = presetNames.indexOf(basePreset) ?? 0
            const name = presetNames[(currentIndex + 1) % presetNames.length]
            applyPreset(name)
        }
        hasSmartknobInitialized.current = true
    }, [smartKnobState.pressNonce])

    return (
        <>
            <Container component="main" maxWidth="lg">
                <Paper variant="outlined" sx={{my: {xs: 3, md: 6}, p: {xs: 2, md: 3}}}>
                    <Typography component="h1" variant="h5">
                        Basic SmartKnob Web Serial Demo
                    </Typography>
                    {smartKnob !== null ? (
                        <>
                            <Box
                                component="form"
                                sx={{
                                    '& .MuiTextField-root': {m: 1, width: '25ch'},
                                }}
                                noValidate
                                autoComplete="off"
                                onSubmit={(event) => {
                                    event.preventDefault()
                                    setSmartKnobConfig(parseStringConfig(pendingSmartKnobConfig))
                                }}
                            >
                                <Box className="MuiTextField-root">
                                    <InputLabel id="preset-label">Preset</InputLabel>
                                    <Select
                                        value={basePreset}
                                        onChange={(e) => applyPreset(e.target.value)}
                                        labelId="preset-label"
                                        id="preset"
                                    >
                                        {Object.keys(presets).map((k) => (
                                            <MenuItem key={k} value={k}>
                                                {k}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Box>
                                <Divider />
                                <br />
                                <TextField
                                    label="Position"
                                    value={pendingSmartKnobConfig.position}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                position: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <TextField
                                    label="Sub-position unit"
                                    value={pendingSmartKnobConfig.subPositionUnit}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                subPositionUnit: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <TextField
                                    label="Position nonce"
                                    value={pendingSmartKnobConfig.positionNonce}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                positionNonce: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <TextField
                                    label="Min position"
                                    value={pendingSmartKnobConfig.minPosition}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                minPosition: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <TextField
                                    label="Max position"
                                    value={pendingSmartKnobConfig.maxPosition}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                maxPosition: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <TextField
                                    label="Position width (radians)"
                                    value={pendingSmartKnobConfig.positionWidthRadians}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                positionWidthRadians: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <TextField
                                    label="Detent strength unit"
                                    value={pendingSmartKnobConfig.detentStrengthUnit}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                detentStrengthUnit: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <TextField
                                    label="Endstop strength unit"
                                    value={pendingSmartKnobConfig.endstopStrengthUnit}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                endstopStrengthUnit: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <TextField
                                    label="Snap point"
                                    value={pendingSmartKnobConfig.snapPoint}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                snapPoint: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <TextField
                                    label="Snap point bias"
                                    value={pendingSmartKnobConfig.snapPointBias}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                snapPointBias: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <TextField
                                    label="Text"
                                    value={pendingSmartKnobConfig.text}
                                    multiline
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                text: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <TextField
                                    label="Base color"
                                    value={pendingSmartKnobConfig.baseColor}
                                    type="color"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                baseColor: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <TextField
                                    label="Position offset (radians)"
                                    value={pendingSmartKnobConfig.positionOffsetRadians}
                                    type="number"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                positionOffsetRadians: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <TextField
                                    label="Position text"
                                    value={pendingSmartKnobConfig.positionText}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                positionText: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <TextField
                                    label="Meter center"
                                    value={pendingSmartKnobConfig.meterCenter}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                meterCenter: event.target.value,
                                            }
                                        })
                                    }}
                                />
                                <br />
                                <FormLabel>Meter type</FormLabel>
                                <RadioGroup
                                    row
                                    value={pendingSmartKnobConfig.meterType}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        console.log('meterType', event.target.value)
                                        setPendingSmartKnobConfig((cur) => {
                                            return {
                                                ...cur,
                                                meterType: event.target.value,
                                            }
                                        })
                                    }}
                                >
                                    <FormControlLabel value={PB.MeterType.NONE} control={<Radio />} label="None" />
                                    <FormControlLabel
                                        value={PB.MeterType.VERTICAL}
                                        control={<Radio />}
                                        label="Vertical"
                                    />
                                    <FormControlLabel
                                        value={PB.MeterType.HORIZONTAL}
                                        control={<Radio />}
                                        label="Horizontal"
                                    />
                                    <FormControlLabel
                                        value={PB.MeterType.CIRCULAR}
                                        control={<Radio />}
                                        label="Circular"
                                    />
                                    <FormControlLabel value={PB.MeterType.RADIAL} control={<Radio />} label="Radial" />
                                </RadioGroup>
                                <br />
                                <Button type="submit" variant="contained">
                                    Apply
                                </Button>
                            </Box>
                            <pre>{JSON.stringify(smartKnobState, undefined, 2)}</pre>
                        </>
                    ) : navigator.serial ? (
                        <CardActions>
                            <Button onClick={connectToSerial} variant="contained">
                                Connect via Web Serial
                            </Button>
                        </CardActions>
                    ) : (
                        <Typography>
                            Sorry, Web Serial API isn't available in your browser. Try the latest version of Chrome.
                        </Typography>
                    )}
                </Paper>
            </Container>
        </>
    )
}
