import React, { useState, useEffect } from 'react';

interface User {
  gender: string;
  name: {
    first: string;
    last: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  registered: {
    date: string;
  };
}

interface Country {
  name: string;
  users: User[];
}

const App: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>('all');

  useEffect(() => {
    fetch('https://randomuser.me/api/?results=100')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const userMap: Map<string, User[]> = new Map();
        data.results.forEach((user: User) => {
          const country = user.location.country;
          if (!userMap.has(country)) {
            userMap.set(country, []);
          }
          userMap.get(country)?.push(user);
        });

        const sortedCountries = Array.from(userMap.entries()).map(([country, users]) => ({
          name: country,
          users: users.sort((a, b) => Date.parse(b.registered.date) - Date.parse(a.registered.date))
        })).sort((a, b) => b.users.length - a.users.length);

        setCountries(sortedCountries);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []);

  const handleCountryClick = (countryName: string): void => {
    setSelectedCountry(countryName);
  };

  const handleGenderFilterChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    console.log('event',event)
    setGenderFilter(event.target.value);
  };

  const renderUserList = (users: User[]): JSX.Element => {
    return (
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            <div>Name: {user.name.first} {user.name.last}</div>
            <div>Gender: {user.gender}</div>
            <div>City: {user.location.city}</div>
            <div>State: {user.location.state}</div>
            <div>Registered Date: {new Date(user.registered.date).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h2>Country List</h2>
      <ul>
        {countries.map((country, index) => (
          <li key={index} onClick={() => handleCountryClick(country.name)}>
            {country.name} ({country.users.length})
          </li>
        ))}
      </ul>
      {selectedCountry && (
        <>
          <h2>User List ({selectedCountry})</h2>
          <select value={genderFilter} onChange={handleGenderFilterChange}>
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {renderUserList(countries.find(country => country.name === selectedCountry)?.users || [])}
        </>
      )}
    </div>
  );
};

export default App;
