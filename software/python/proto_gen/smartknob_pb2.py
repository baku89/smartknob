# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: smartknob.proto
# Protobuf Python Version: 4.25.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


import nanopb_pb2 as nanopb__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0fsmartknob.proto\x12\x02PB\x1a\x0cnanopb.proto\"\x9a\x01\n\rFromSmartKnob\x12\x1f\n\x10protocol_version\x18\x01 \x01(\rB\x05\x92?\x02\x38\x08\x12\x16\n\x03\x61\x63k\x18\x02 \x01(\x0b\x32\x07.PB.AckH\x00\x12\x16\n\x03log\x18\x03 \x01(\x0b\x32\x07.PB.LogH\x00\x12-\n\x0fsmartknob_state\x18\x04 \x01(\x0b\x32\x12.PB.SmartKnobStateH\x00\x42\t\n\x07payload\"\xa4\x01\n\x0bToSmartknob\x12\x1f\n\x10protocol_version\x18\x01 \x01(\rB\x05\x92?\x02\x38\x08\x12\r\n\x05nonce\x18\x02 \x01(\r\x12)\n\rrequest_state\x18\x03 \x01(\x0b\x32\x10.PB.RequestStateH\x00\x12/\n\x10smartknob_config\x18\x04 \x01(\x0b\x32\x13.PB.SmartKnobConfigH\x00\x42\t\n\x07payload\"\x14\n\x03\x41\x63k\x12\r\n\x05nonce\x18\x01 \x01(\r\"\x1a\n\x03Log\x12\x13\n\x03msg\x18\x01 \x01(\tB\x06\x92?\x03p\xff\x01\"\x86\x01\n\x0eSmartKnobState\x12\x18\n\x10\x63urrent_position\x18\x01 \x01(\x05\x12\x19\n\x11sub_position_unit\x18\x02 \x01(\x02\x12#\n\x06\x63onfig\x18\x03 \x01(\x0b\x32\x13.PB.SmartKnobConfig\x12\x1a\n\x0bpress_nonce\x18\x04 \x01(\rB\x05\x92?\x02\x38\x08\"\xbf\x03\n\x0fSmartKnobConfig\x12\x10\n\x08position\x18\x01 \x01(\x05\x12\x19\n\x11sub_position_unit\x18\x02 \x01(\x02\x12\x1d\n\x0eposition_nonce\x18\x03 \x01(\rB\x05\x92?\x02\x38\x08\x12\x14\n\x0cmin_position\x18\x04 \x01(\x05\x12\x14\n\x0cmax_position\x18\x05 \x01(\x05\x12\x1e\n\x16position_width_radians\x18\x06 \x01(\x02\x12\x1c\n\x14\x64\x65tent_strength_unit\x18\x07 \x01(\x02\x12\x1d\n\x15\x65ndstop_strength_unit\x18\x08 \x01(\x02\x12\x12\n\nsnap_point\x18\t \x01(\x02\x12\x13\n\x04text\x18\n \x01(\tB\x05\x92?\x02p2\x12\x1f\n\x10\x64\x65tent_positions\x18\x0b \x03(\x05\x42\x05\x92?\x02\x10\x05\x12\x17\n\x0fsnap_point_bias\x18\x0c \x01(\x02\x12\x12\n\nbase_color\x18\r \x01(\r\x12\x1f\n\x17position_offset_radians\x18\x0e \x01(\x02\x12\x1c\n\rposition_text\x18\x0f \x01(\tB\x05\x92?\x02p\x14\x12!\n\nmeter_type\x18\x10 \x01(\x0e\x32\r.PB.MeterType\"\x0e\n\x0cRequestState\"v\n\x17PersistentConfiguration\x12\x0f\n\x07version\x18\x01 \x01(\r\x12#\n\x05motor\x18\x02 \x01(\x0b\x32\x14.PB.MotorCalibration\x12%\n\x06strain\x18\x03 \x01(\x0b\x32\x15.PB.StrainCalibration\"p\n\x10MotorCalibration\x12\x12\n\ncalibrated\x18\x01 \x01(\x08\x12\x1e\n\x16zero_electrical_offset\x18\x02 \x01(\x02\x12\x14\n\x0c\x64irection_cw\x18\x03 \x01(\x08\x12\x12\n\npole_pairs\x18\x04 \x01(\r\"<\n\x11StrainCalibration\x12\x12\n\nidle_value\x18\x01 \x01(\x05\x12\x13\n\x0bpress_delta\x18\x02 \x01(\x05*M\n\tMeterType\x12\x0c\n\x08VERTICAL\x10\x00\x12\x0e\n\nHORIZONTAL\x10\x01\x12\n\n\x06RADIAL\x10\x02\x12\x0c\n\x08\x43IRCULAR\x10\x03\x12\x08\n\x04NONE\x10?b\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'smartknob_pb2', _globals)
if _descriptor._USE_C_DESCRIPTORS == False:
  DESCRIPTOR._options = None
  _globals['_FROMSMARTKNOB'].fields_by_name['protocol_version']._options = None
  _globals['_FROMSMARTKNOB'].fields_by_name['protocol_version']._serialized_options = b'\222?\0028\010'
  _globals['_TOSMARTKNOB'].fields_by_name['protocol_version']._options = None
  _globals['_TOSMARTKNOB'].fields_by_name['protocol_version']._serialized_options = b'\222?\0028\010'
  _globals['_LOG'].fields_by_name['msg']._options = None
  _globals['_LOG'].fields_by_name['msg']._serialized_options = b'\222?\003p\377\001'
  _globals['_SMARTKNOBSTATE'].fields_by_name['press_nonce']._options = None
  _globals['_SMARTKNOBSTATE'].fields_by_name['press_nonce']._serialized_options = b'\222?\0028\010'
  _globals['_SMARTKNOBCONFIG'].fields_by_name['position_nonce']._options = None
  _globals['_SMARTKNOBCONFIG'].fields_by_name['position_nonce']._serialized_options = b'\222?\0028\010'
  _globals['_SMARTKNOBCONFIG'].fields_by_name['text']._options = None
  _globals['_SMARTKNOBCONFIG'].fields_by_name['text']._serialized_options = b'\222?\002p2'
  _globals['_SMARTKNOBCONFIG'].fields_by_name['detent_positions']._options = None
  _globals['_SMARTKNOBCONFIG'].fields_by_name['detent_positions']._serialized_options = b'\222?\002\020\005'
  _globals['_SMARTKNOBCONFIG'].fields_by_name['position_text']._options = None
  _globals['_SMARTKNOBCONFIG'].fields_by_name['position_text']._serialized_options = b'\222?\002p\024'
  _globals['_METERTYPE']._serialized_start=1310
  _globals['_METERTYPE']._serialized_end=1387
  _globals['_FROMSMARTKNOB']._serialized_start=38
  _globals['_FROMSMARTKNOB']._serialized_end=192
  _globals['_TOSMARTKNOB']._serialized_start=195
  _globals['_TOSMARTKNOB']._serialized_end=359
  _globals['_ACK']._serialized_start=361
  _globals['_ACK']._serialized_end=381
  _globals['_LOG']._serialized_start=383
  _globals['_LOG']._serialized_end=409
  _globals['_SMARTKNOBSTATE']._serialized_start=412
  _globals['_SMARTKNOBSTATE']._serialized_end=546
  _globals['_SMARTKNOBCONFIG']._serialized_start=549
  _globals['_SMARTKNOBCONFIG']._serialized_end=996
  _globals['_REQUESTSTATE']._serialized_start=998
  _globals['_REQUESTSTATE']._serialized_end=1012
  _globals['_PERSISTENTCONFIGURATION']._serialized_start=1014
  _globals['_PERSISTENTCONFIGURATION']._serialized_end=1132
  _globals['_MOTORCALIBRATION']._serialized_start=1134
  _globals['_MOTORCALIBRATION']._serialized_end=1246
  _globals['_STRAINCALIBRATION']._serialized_start=1248
  _globals['_STRAINCALIBRATION']._serialized_end=1308
# @@protoc_insertion_point(module_scope)
