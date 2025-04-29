import React from "react";
import dayjs from "dayjs";
import ReactApexChart from "react-apexcharts";

const WeatherCard = ({ todayWeather, weather }) => {
  if (!todayWeather || !weather) {
    return (
      <div className="w-full h-[260px] bg-gray-100 rounded-2xl shadow p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  // Récupérer les prévisions à 12:00 pour les prochains jours
  const dailyForecasts = weather.list
    .filter(item => item.dt_txt.includes('12:00:00'))
    .slice(0, 4);

  // Préparer les données pour le graphique
  const forecastTemps = dailyForecasts.map(day => Math.round(day.main.temp));
  const forecastDates = dailyForecasts.map(day => dayjs(day.dt_txt).format('DD/MM'));

  return (
<div className="w-full min-h-[450px] bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
{/* Date de mise à jour */}
      <div className="text-xs text-gray-400 flex justify-between">
        <p>Mis à jour le: {dayjs.unix(weather.city.sunrise).format('YYYY/MM/DD')}</p>
        <span className="text-gray-500 text-xs">🔄</span>
      </div>

      {/* Température actuelle */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <p className="text-3xl font-bold">{Math.round(todayWeather.main.temp)}°C</p>
          <p className="text-sm text-gray-600 capitalize">{todayWeather.weather[0].description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>🌬 {todayWeather.wind.speed} m/s</span>
            <span>🌅 {dayjs.unix(weather.city.sunrise).format('HH:mm')}</span>
            <span>🌇 {dayjs.unix(weather.city.sunset).format('HH:mm')}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <img
            src={`http://openweathermap.org/img/wn/${todayWeather.weather[0].icon}@2x.png`}
            alt="weather icon"
            className="w-12 h-12"
          />
          <p className="text-xs mt-1">{dayjs().format('ddd').toUpperCase()}</p>
        </div>
      </div>

      {/* Mini graphique température */}
      <div className="mt-4 text-gray-600">
        <ReactApexChart
          type="line"
          height={100}
          series={[{ data: forecastTemps }]}
          options={{
            chart: {
              toolbar: { show: false },
              sparkline: { enabled: true },
            },
            stroke: {
              curve: "smooth",
              width: 2,
            },
            markers: {
              size: 4,
            },
            xaxis: {
              categories: forecastDates,
              labels: { show: false },
            },
            yaxis: { labels: { show: false } },
            grid: { show: false },
          }}
        />
      </div>

      {/* Prévision 4 jours */}
      <div className="grid grid-cols-4 gap-2 mt-2 text-center text-xs text-gray-600">
        {dailyForecasts.map((day, index) => (
          <div key={index} className="flex flex-col text-gray-600 items-center">
            <img
              src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
              alt="day icon"
              className="w-8 h-8 text-gray-600"
            />
            <p>{Math.round(day.main.temp)}°C</p>
            <p>{dayjs(day.dt_txt).format('ddd').toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherCard;
