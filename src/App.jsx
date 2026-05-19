import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [intakes, setIntakes] = useState([]);
  const [todayIntake, setTodayIntake] = useState(0);
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState(85);

  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    const saved = localStorage.getItem('waterTrackerData');
    if (saved) {
      const data = JSON.parse(saved);
      setIntakes(data.intakes || []);
      setStreak(data.streak || 0);
      if (data.userSetGoal) {
        setGoal(data.goal || 85);
      }
    }
  }, []);

  useEffect(() => {
    const todayEntry = intakes.find(entry => entry.date === today);
    setTodayIntake(todayEntry ? todayEntry.amount : 0);
  }, [intakes, today]);

  useEffect(() => {
    localStorage.setItem('waterTrackerData', JSON.stringify({ intakes, streak, goal, userSetGoal: goal !== 85 }));
  }, [intakes, streak, goal]);

  const addWater = (amount) => {
    const todayEntry = intakes.find(entry => entry.date === today);
    if (todayEntry) {
      setIntakes(
        intakes.map(entry =>
          entry.date === today
            ? { ...entry, amount: entry.amount + amount }
            : entry
        )
      );
    } else {
      setIntakes([...intakes, { date: today, amount }]);
    }
  };

  const resetToday = () => {
    setIntakes(intakes.filter(entry => entry.date !== today));
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA');
      const entry = intakes.find(e => e.date === dateStr);
      result.push({
        day: days[date.getDay()],
        amount: entry ? entry.amount : 0,
        hitGoal: entry ? entry.amount >= goal : false,
      });
    }
    return result;
  };

  const getStreak = () => {
    let count = 0;
    const date = new Date();
    while (true) {
      const dateStr = date.toLocaleDateString('en-CA');
      const entry = intakes.find(e => e.date === dateStr);
      if (entry && entry.amount >= goal) {
        count++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  };

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Acqua Tracker</h1>
          <p className="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </header>

        <section className="progress-section">
          <div className="progress-card">
            <div className="intake-display">
              <span className="intake-number">{todayIntake}</span>
              <span className="intake-label">oz / {goal} oz</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((todayIntake / goal) * 100, 100)}%` }}></div>
            </div>
          </div>
        </section>

        <section className="buttons-section">
          <button onClick={() => addWater(8)}>☕ 8 oz</button>
          <button onClick={() => addWater(20)}>🥤 20 oz</button>
          <button onClick={() => addWater(30)}>💧 30 oz</button>
          <button onClick={() => {
            const custom = prompt('Enter amount in oz:');
            if (custom && !isNaN(custom)) addWater(parseFloat(custom));
          }}>Custom</button>
          <button onClick={() => {
            if (confirm('Reset today\'s intake?')) resetToday();
          }} style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.1)' }}>Reset today</button>
        </section>

        <section className="streak-section">
          <div className="streak-card">
            <span className="streak-label">Current streak</span>
            <span className="streak-number">{getStreak()} days</span>
          </div>
        </section>

        <section className="weekly-section">
          <h2>This week</h2>
          <div className="weekly-chart">
            {getWeeklyData().map((entry, i) => (
              <div key={i} className="bar-container">
                <div
                  className={`bar ${entry.hitGoal ? 'hit-goal' : ''}`}
                  style={{ height: `${Math.max((entry.amount / goal) * 100, 5)}%` }}
                ></div>
                <span className="bar-label">{entry.day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}