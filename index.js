if (!process.env['MQTT_HOST']) throw new Error('Missing MQTT_HOST env variable');
const MQTT_HOST = process.env["MQTT_HOST"];
const WEB_PORT = process.env["HTTP_PORT"] ?? 3000;

const http = require("http");
const url = require("url");

const mqtt = require("mqtt");

const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}`);

const healthTopic = "health/http-to-mqtt";

mqttClient.on("connect", () => {
  console.log(`MQTT connected to ${MQTT_HOST}`);

  console.log(`Starting web server at port ${WEB_PORT}`);
  http.createServer(handler).listen(WEB_PORT);
});

const handler = (req, res) => {
  if (req?.url === "/health") {
    mqttClient.publish(healthTopic, 'OK', undefined, (err, packet) => {
      if (err) {
        res.writeHead(503, { "Content-Type": "text/plain" });
      }
      res.end();
    });
    return;
  }

  const { topic, message, retain } = url.parse(req.url, true).query;

  if (!topic || !message) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end();
    return;
  }

  mqttClient.publish(topic, message, retain ? { retain: true } : undefined, (err, packet) => {
    res.end();
  });
};

mqttClient.publish(healthTopic, 'OK', undefined, (err) => {
  if (err) console.error(err);
});
