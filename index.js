if (!process.env['MQTT_HOST']) throw new Error('Missing MQTT_HOST env variable');

const http = require('http');
const url = require('url');

const mqtt = require('mqtt');

const mqttClient = mqtt.connect(`mqtt://${process.env['MQTT_HOST']}`);

const handler = (req, res) => {
    const { topic, message, retain } = url.parse(req.url, true).query;

    if (!topic || !message) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return;
    }

    mqttClient.publish(topic, message, retain ? { retain: true } : undefined);
    res.end();
}

http.createServer(handler).listen(process.env['HTTP_PORT'] ?? 3000);
