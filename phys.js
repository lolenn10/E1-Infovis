// codigo creado en base a los ejemplos del profe
import Protobject from './js/protobject.js';
import Arduino from './js/arduino.js';

Arduino.start();

let interval, i = 0, val;

Protobject.onReceived((data) => {
    val = data * 350;
    clearInterval(interval);
    
    if (val > 0) {
        interval = setInterval(() => {
            i = Math.min(i + 1, val);
            Arduino.contServoWrite({ pin: 5, value: i });
        }, 10);
    } else {
        i = 0;
        Arduino.contServoWrite({ pin: 5, value: 0 });
    }
});