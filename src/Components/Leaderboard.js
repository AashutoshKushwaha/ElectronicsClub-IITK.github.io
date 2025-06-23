import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRlYfXayJkfwtIWcG5-w8_UEt66uGRqDLOf4SFBbtzuO_5zO9a7Uwv8a4-An3f9thC-5NtdCqAkiNzR/pub?output=csv&gid=918222027') // Replace with actual gid
      .then(res => res.text())
      .then(csv => {
        const [headerLine, ...lines] = csv.trim().split('\n');
        const headers = headerLine.split(',');
        const entries = lines.map(line => {
          const cols = line.split(',');
          return headers.reduce((obj, key, i) => {
            obj[key.trim()] = cols[i].trim();
            return obj;
          }, {});
        });
        setData(entries);
      });
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-bg" />
      <div className="leaderboard-content">
        <h1>Leaderboard</h1>
        {data.length ? (
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading leaderboard...</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
