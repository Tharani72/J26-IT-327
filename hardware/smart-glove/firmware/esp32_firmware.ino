/*#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// Wi-Fi Configurations
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

WebSocketsServer webSocket = WebSocketsServer(81);
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

// Flex Sensor Analog Pins (ESP32 ADC1 Pins)
const int flexPins[5] = {34, 35, 32, 33, 39};

// Pediatric Safety Limits (0 to 85 degrees)
const int MIN_ANGLE = 0;
const int MAX_ANGLE = 85;

void setup() {
  Serial.begin(115200);

  // 1. Wi-Fi Connect කිරීම
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! Glove Controller IP: ");
  Serial.println(WiFi.localIP());

  // 2. PCA9685 Servo Driver Init කිරීම
  pwm.begin();
  pwm.setPWMFreq(50); // 50 Hz PWM frequency for MG90S Servos

  // 3. WebSocket Server එක Port 81 හි ආරම්භ කිරීම
  webSocket.begin();
  Serial.println("WebSocket Server Started on Port 81. Smart Glove Ready!");
}

void loop() {
  webSocket.loop();

  // Flex Sensors කියවා JSON Payload එකක් හැදීම
  String json = "{\"glove_connected\":true,\"battery\":95,\"angles\":{";
  const char* fingers[5] = {"thumb", "index", "middle", "ring", "little"};

  for (int i = 0; i < 5; i++) {
    int rawValue = analogRead(flexPins[i]);
    // 2-Point Normalization (Raw ADC to 0-85 degrees)
    int angle = map(rawValue, 1500, 3000, MIN_ANGLE, MAX_ANGLE);
    angle = constrain(angle, MIN_ANGLE, MAX_ANGLE);

    json += "\"" + String(fingers[i]) + "\":" + String(angle);
    if (i < 4) json += ",";
  }
  json += "}}";

  // Frontend එකට දත්ත විකාශනය කිරීම
  webSocket.broadcastTXT(json);
  delay(100); // 10 Hz telemetry rate
} */