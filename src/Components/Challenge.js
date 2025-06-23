import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './Challenge.css';

const Challenge = () => {
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vRlYfXayJkfwtIWcG5-w8_UEt66uGRqDLOf4SFBbtzuO_5zO9a7Uwv8a4-An3f9thC-5NtdCqAkiNzR/pub?output=csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      transform: (value) => {
        // Clean newlines and extra quotes
        return value.replace(/\r\n|\n|\r/g, ' ').replace(/"/g, '"').trim();
      },
      complete: (result) => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const matched = result.data.find(r => r.Month === currentMonth);
        console.log('Parsed Challenge:', matched); // Debug
        setChallenge(matched);
      },
      error: (error) => console.error('CSV Parsing Error:', error),
    });
  }, []);

  return (
    <div className="challenge-container">
      <div className="challenge-bg" />
      <div className="challenge-content">
        <h1>Monthly Challenge</h1>
        {challenge ? (
          <>
            <h2>{challenge.Title}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{challenge.Description}</p>
            <a href={challenge.Link} target="_blank" rel="noreferrer">
              Submit Your Solution
            </a>
          </>
        ) : (
          <p>Loading or no challenge available...</p>
        )}
      </div>
    </div>
  );
};

export default Challenge;