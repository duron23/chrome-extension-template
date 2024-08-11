import mqtt from "mqtt";

console.log("Initializing MQTT connection");
//connectMqtt();
console.log("MQTT connection initiated");
export function connectMqtt() {
  console.log("Running connect Mqtt");
  try {
    let client = mqtt.connect("ws://10.5.1.6:1884");
    console.log("MQTT client created");

    client.on("connect", function () {
      console.log("MQTT connected");
      client.publish("hello", "World");
      console.log("Message published");
    });

    client.on("error", function (error) {
      console.log("MQTT connection error: ", error);
    });
  } catch (e) {
    console.log("Error in connectMqtt: ", e);
  }
}
