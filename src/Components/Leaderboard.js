import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual GID
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRlYfXayJkfwtIWcG5-w8_UEt66uGRqDLOf4SFBbtzuO_5zO9a7Uwv8a4-An3f9thC-5NtdCqAkiNzR/pub?output=csv&gid=918222027')
      .then(res => res.text())
      .then(csv => {
        const [headerLine, ...lines] = csv.trim().split('\n');
        const headers = headerLine.split(',').map(h => h.trim());

        // Parse CSV into a flat array of objects first
        const rawEntries = lines.map(line => {
          const cols = line.split(',');
          return headers.reduce((obj, key, i) => {
            obj[key] = cols[i] ? cols[i].trim() : '';
            return obj;
          }, {});
        });

        // Group data by Month and Challenge Name
        // Assumption based on prompt: 
        // Index 0 = Challenge Name
        // Index 1 = Month
        // Rest = Data (Roll, Name, Rank)
        const groups = {};
        
        rawEntries.forEach(entry => {
          const challengeName = entry[headers[0]]; 
          const month = entry[headers[1]];
          const groupKey = `${month}::${challengeName}`; // Unique key for grouping

          if (!groups[groupKey]) {
            groups[groupKey] = {
              month: month,
              challengeName: challengeName,
              entries: []
            };
          }

          // Create a new object excluding the Challenge and Month from the table rows
          // to avoid repetitive columns
          const entryData = { ...entry };
          delete entryData[headers[0]];
          delete entryData[headers[1]];
          
          groups[groupKey].entries.push(entryData);
        });

        // Convert groups object to array and sort by Date (Latest first)
        const sortedGroups = Object.values(groups).sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          // Sort descending (newest first)
          return dateB - dateA;
        });

        setGroupedData(sortedGroups);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching CSV:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-bg" />
      <div className="leaderboard-content">
        <h1 className="main-title">Leaderboard</h1>
        
        {loading && <p>Loading leaderboard...</p>}

        {!loading && groupedData.map((group, index) => (
          <div key={index} className="challenge-section">
            <div className="challenge-header">
              <h2>{group.challengeName}</h2>
              <span className="challenge-month">{group.month}</span>
            </div>
            
            <table>
              <thead>
                <tr>
                  {group.entries.length > 0 && Object.keys(group.entries[0]).map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.entries.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        
        {!loading && groupedData.length === 0 && <p>No data found.</p>}
      </div>
    </div>
  );
};

export default Leaderboard;