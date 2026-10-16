"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [cityName, setCityName] = useState("東京");
  const [searchQuery, setSearchQuery] = useState("");
  const [coords, setCoords] = useState({ lat: 35.68, lon: 139.77 });
  const [weather, setWeather] = useState<any>(null);

  const getWeatherInfo = (code: number) => {
    switch (code) {
      case 0:
        return { text: "快晴", emoji: "☀️" };
      case 1:
      case 2:
      case 3:
        return { text: "晴れ時々曇り", emoji: "⛅" };
      case 45:
      case 48:
        return { text: "霧", emoji: "🌫️" };
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        return { text: "霧雨", emoji: "🌧️" };
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
        return { text: "雨", emoji: "☔" };
      case 71:
      case 73:
      case 75:
      case 77:
        return { text: "雪", emoji: "❄️" };
      case 80:
      case 81:
      case 82:
        return { text: "にわか雨", emoji: "🌦️" };
      case 85:
      case 86:
        return { text: "にわか雪", emoji: "🌨️" };
      case 95:
      case 96:
      case 99:
        return { text: "雷雨", emoji: "⚡" };
      default:
        return { text: "曇り", emoji: "☁️" };
    }
  };

  const getTempColor = (temp: number) => {
    if (temp >= 25) return "text-red-500 font-bold";
    if (temp <= 10) return "text-blue-500 font-bold";
    return "text-slate-700 font-bold";
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        searchQuery
      )}&count=1&language=ja&format=json`;
      const res = await fetch(geoUrl);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        setCoords({ lat: place.latitude, lon: place.longitude });
        setCityName(place.name);
        setSearchQuery("");
      } else {
        alert("都市が見つかりませんでした。");
      }
    } catch (error) {
      alert("検索中にエラーが発生しました。");
    }
  };

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
      });
  }, [coords]);

  if (!weather || !weather.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          読み込み中...
        </p>
      </div>
    );
  }

  const currentWeather = getWeatherInfo(weather.current.weather_code);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-4 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              天気予報アプリ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              世界の都市のリアルタイム天気と週間予報
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="都市名を入力 (例: Kyoto, Tokyo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white/80 backdrop-blur focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-xs shadow-sm transition-all"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all"
            >
              検索
            </button>
          </form>
        </header>

        {/* Current Weather Section */}
        <section className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-4 md:p-5 shadow-sm max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900">{cityName}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              現在の天気
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-baseline gap-1.5">
              <span className="text-slate-500">いまの気温:</span>
              <span className={`text-2xl ${getTempColor(weather.current.temperature_2m)}`}>
                {weather.current.temperature_2m}℃
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">天気:</span>
              <span className="font-medium text-slate-700">
                {currentWeather.text} {currentWeather.emoji}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">風速:</span>
              <span className="font-medium text-slate-700">{weather.current.wind_speed_10m} km/h</span>
            </div>
          </div>
        </section>

        {/* 7-Day Forecast Section */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">週間予報（7日間）</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {weather.daily?.time?.map((date: string, index: number) => {
              const dayWeather = getWeatherInfo(weather.daily.weather_code[index]);
              return (
                <div
                  key={date}
                  className="bg-white/80 backdrop-blur border border-white/80 p-2.5 rounded-xl shadow-xs hover:shadow-sm transition-all flex flex-col items-center text-center space-y-1"
                >
                  <p className="text-[10px] font-medium text-slate-500">
                    {date.slice(5)}
                  </p>
                  
                  <span className="text-xl my-0.5">{dayWeather.emoji}</span>
                  
                  <p className="text-[11px] font-medium text-slate-700 truncate w-full">
                    {dayWeather.text}
                  </p>

                  <div className="space-y-0.5 text-[10px] w-full pt-1.5 border-t border-slate-100">
                    <p className="text-red-500 font-medium">
                      最高: {weather.daily.temperature_2m_max[index]}℃
                    </p>
                    <p className="text-blue-500 font-medium">
                      最低: {weather.daily.temperature_2m_min[index]}℃
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}