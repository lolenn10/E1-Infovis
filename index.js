import "https://cdn.plot.ly/plotly-2.34.0.min.js";
import Protobject from './js/protobject.js';

document.body.insertAdjacentHTML('beforeend', `
  <div id="myDiv"></div>
  <div id="hover-info">
    <img id="img">
    <div id="hover-details">
      <span id="winner-name"></span>
      <span id="year"></span>
      <span id="time"></span>
      <span id="message-info"></span>
    </div>
  </div>
  <audio id="running-sound" src="./Sonidos/corriendo.mp3" preload="auto"></audio>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    #hover-info {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 175px;
      left: 1000px;
      padding: 20px;
      opacity: 0;
    }
    img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 20px;
    }
    span {
      font-family: Arial;
      color: #000;
    }
    #time {
      font-size: 20px;
      font-weight: 800;
    }
    #time:after {
      content: " Segundos";
      font-size: 16px;
      font-weight: 400;
    }
  </style>
`);

fetch('modified_records.json')
  .then(response => response.json())
  .then(data => {
    const years = data.map(entry => entry.Year);
    const menTimes = data.map(entry => entry.Men);
    const womenTimes = data.map(entry => entry.Women === "-" ? null : entry.Women);
    const menSpeeds = data.map(entry => entry.Men_Speed);
    const womenSpeeds = data.map(entry => entry.Women_Speed);
    const menCustomData = data.map(entry => ({
      winner: entry.men_winner,
      photo: `./public/${entry.men_photo}`,
      city: entry.City,
      speed: entry.Men_Speed,
    }));
    const womenCustomData = data.map(entry => ({
      winner: entry.women_winner,
      photo: `./public/${entry.women_photo}`,
      city: entry.City,
      speed: entry.Women_Speed,
    }));

    const sendToPhys = (speed) => {
      Protobject.send({ pin: 5, value: Math.round(speed) }).to('phys.js');
    };

    const updateHoverInfo = (data) => {
      const { year, city, winner, photo, speed, time, message, color } = data;

      document.getElementById('winner-name').innerText = winner;
      document.getElementById('year').innerText = `${city}, ${year}`;
      document.getElementById('time').innerText = time;
      document.getElementById('img').src = photo;
      document.getElementById('img').alt = winner;
      document.getElementById('message-info').innerText = message;
      document.getElementById('message-info').style.color = color;

      document.getElementById('hover-info').style.opacity = 1;
    };

    const resetHoverInfo = () => {
      document.getElementById('hover-info').style.opacity = 0;
      document.getElementById('running-sound').pause();
      Protobject.send({ pin: 5, value: 0 }).to('phys.js');
    };

    const traceMen = {
      x: years,
      y: menTimes,
      customdata: menCustomData,
      mode: 'lines+markers',
      name: 'Hombres',
      marker: { color: '#1f77b4', size: 12 },
    };

    const traceWomen = {
      x: years,
      y: womenTimes,
      customdata: womenCustomData,
      mode: 'lines+markers',
      name: 'Mujeres',
      marker: { color: '#9f7f34', size: 12 },
    };

    const layout = {
      showlegend: false,
      xaxis: { title: 'Años', type: 'category' },
      yaxis: { title: 'Tiempo (segundos)' },
      height: 650,
      width: 1350,
    };

    const myPlot = document.getElementById('myDiv');
    const runningSound = document.getElementById('running-sound');

    Plotly.newPlot(myPlot, [traceMen, traceWomen], layout);

    myPlot.on('plotly_hover', (event) => {
      const point = event.points[0];
      const customData = point.customdata;

      const hoverData = {
        year: point.x,
        city: customData.city,
        winner: customData.winner,
        photo: customData.photo,
        speed: customData.speed,
        time: point.y,
        message: '', 
        color: '#000',
      };

      sendToPhys(hoverData.speed);
      if (runningSound.paused) {
        runningSound.currentTime = 0;
        runningSound.play();
      }
      updateHoverInfo(hoverData);
    });

    myPlot.on('plotly_unhover', resetHoverInfo);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));
