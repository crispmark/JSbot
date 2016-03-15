#!/usr/bin/python
from Adafruit_MotorHAT import Adafruit_MotorHAT, Adafruit_DCMotor

#import time
#import atexit
import sys, json

# create a default object, no changes to I2C address or frequency
mh = Adafruit_MotorHAT(addr = 0x60)

def runMotor(n, spd):
	myMotor = mh.getMotor(n)

	if spd < 0 and spd >= -255:
		myMotor.run(Adafruit_MotorHAT.BACKWARD)

	elif spd > 0 and spd <= 255:
		myMotor.run(Adafruit_MotorHAT.FORWARD)

	else:
		myMotor.run(Adafruit_MotorHAT.RELEASE)

	absSpeed = abs(spd)
	myMotor.setSpeed(absSpeed)

# accept commands
for line in sys.stdin:
	command = json.loads(line[:-1])
	lmotor = command['left']['motor']
	lspeed = command['left']['speed']
	rmotor = command['right']['motor']
	rspeed = command['right']['speed']
	runMotor(lmotor, lspeed)
	runMotor(rmotor, rspeed)
	print ('ya did it')
