# JSbot

This is a project for controlling a raspberry pi robot through Node.js

Parts Used:
* Raspberry Pi 2 model B
* Raspberry Pi Camera
* Wi-Fi dongle
* Portable cell phone charger
* Tamiya Twin-Motor Gearbox
* Tamiya Track & Wheel Set
* Tamiya Universal Plate Set
* Adafruit DC & Stepper Motor HAT for Raspberry Pi
* 2 red & 2 green LEDs
* Battery Holder - 4xAA

Raspberry Pi Setup:

[Install Arch Linux](https://archlinuxarm.org/platforms/armv7/broadcom/raspberry-pi-2)

Install ffmpeg, wiringpi and Node.js on the Raspberry Pi

Follow the instructions for [enabling i2c](https://wiki.archlinux.org/index.php/Raspberry_Pi#I2C) and [setting up the camera](https://wiki.archlinux.org/index.php/Raspberry_Pi#Raspberry_Pi_camera_module)

Clone this repository, run npm install, and then sudo node server

Then type in the ip of your Raspberry Pi into a web browser, followed by port 3001
