import { LoadingButton } from "@mui/lab";
import { Box, Container, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Card, CardContent,
ToggleButton, ToggleButtonGroup, Button, List, ListItem, ListItemText, IconButton, Grid} from "@mui/material";
import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

export default function App() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ error: false, message: "" });
  const [unit, setUnit] = useState("metric");
  const [weather, setWeather] = useState(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [favorites, setFavorites] = useState([]);

  const countries = {
    "Estados Unidos": "US",
    "México": "MX",
    "Argentina": "AR",
    "Colombia": "CO",
    "Costa Rica": "CR",
    "España": "ES",
    "Perú": "PE",
  };

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  const fetchWeather = async (selectedCity = city, selectedCountry = country) => {
    try {
      if (!selectedCountry) throw { message: "Debe seleccionar un país" };
      if (!selectedCity.trim()) throw { message: "El campo ciudad es obligatorio" };

      setLoading(true);
      const API_KEY = import.meta.env.VITE_API_KEY;
      const API_WEATHER = `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity},${countries[selectedCountry]}&appid=${API_KEY}&units=metric&lang=es`;

      const response = await fetch(API_WEATHER);
      if (!response.ok) throw { message: "No se pudo obtener el clima, revisa la ciudad ingresada" };

      const data = await response.json();

      setWeather({
        city: data.name,
        country: data.sys.country,
        tempC: data.main.temp,
        tempMinC: data.main.temp_min,
        tempMaxC: data.main.temp_max,
        feelsLikeC: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        conditionText: data.weather[0].description
        .split(" ") 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
        .join(" "), 
    });

      setBgColor(getBackgroundColor(data.main.temp));
      setError({ error: false, message: "" });
    } catch (error) {
      setError({ error: true, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  const convertTemp = (tempC) => {
    return unit === "metric" ? tempC : (tempC * 9) / 5 + 32;
  };

  const getBackgroundColor = (temp) => {
    if (temp <= 0) return "linear-gradient(to right, #0f0c29, #302b63, #24243e)"; 
    if (temp > 0 && temp <= 10) return "linear-gradient(to right, #283c86, #45a247)"; 
    if (temp > 10 && temp <= 20) return "linear-gradient(to right, #3a7bd5, #3a6073)"; 
    if (temp > 20 && temp <= 25) return "linear-gradient(to right, #b8e994, #78e08f)"; 
    if (temp > 25 && temp <= 30) return "linear-gradient(to right, #ffb75e, #ed8f03)"; 
    if (temp > 30 && temp <= 35) return "linear-gradient(to right, #ff7e5f, #feb47b)"; 
    return "linear-gradient(to right, #ff512f, #dd2476)"; 
  };  

  const addFavorite = () => {
    if (city && country) {
      let formattedCity = city
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()); 
  
      const newFavorite = { city: formattedCity, country };
  
      if (!favorites.some((fav) => fav.city === formattedCity && fav.country === country)) {
        const newFavorites = [...favorites, newFavorite];
        setFavorites(newFavorites);
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
      }
    }
  };  

  const removeFavorite = (index) => {
    const newFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const loadFavorite = (favorite) => {
    setCity(favorite.city);
    setCountry(favorite.country);
    fetchWeather(favorite.city, favorite.country);
  };

  return (
    <Box sx={{ background: bgColor, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>

      <Container maxWidth="xs" sx={{ backgroundColor: "white", p: 2, borderRadius: "10px", boxShadow: 3 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Información Meteorológica
        </Typography>

        <Box sx={{ display: "grid", gap: 2 }} component="form" autoComplete="off" onSubmit={onSubmit}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id="country-label">Selecciona un país</InputLabel>
        <Select
            labelId="country-label"
            value={country}
            onChange={(e) => { setCountry(e.target.value); setCity(""); }}
            label="Selecciona un país"
        >
          {Object.keys(countries).map((countryName) => (
            <MenuItem key={countryName} value={countryName}>
              {countryName}
            </MenuItem>
        ))}
        </Select>
        </FormControl>

        <TextField
  id="city"
  label="Ciudad"
  variant="outlined"
  size="small"
  required
  fullWidth
  value={city}
  onChange={(e) => {
    let formattedCity = e.target.value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
    setCity(formattedCity);
  }}
  error={error.error}
  helperText={error.message}
  disabled={!country}
/>

          <ToggleButtonGroup
            value={unit}
            exclusive
            onChange={(e, newUnit) => newUnit && setUnit(newUnit)}
            fullWidth
          >
            <ToggleButton value="metric">°C</ToggleButton>
            <ToggleButton value="imperial">°F</ToggleButton>
          </ToggleButtonGroup>

          <LoadingButton type="submit" variant="contained" loading={loading}>
            Buscar
          </LoadingButton>

          <Button variant="outlined" onClick={addFavorite} disabled={!city || !country}>
            Guardar en Favoritos
          </Button>
        </Box>

        {favorites.length > 0 && (
          <List>
            <Typography variant="h6">Ciudades Guardadas</Typography>
            {favorites.map((fav, index) => (
              <ListItem key={index} button onClick={() => loadFavorite(fav)}>
                <ListItemText primary={`${fav.city}, ${fav.country}`} />
                <IconButton edge="end" onClick={() => removeFavorite(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}

        {weather && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" align="center">{weather.city}, {weather.country}</Typography>
              <Typography align="center">
                <img src={weather.icon} alt={weather.conditionText} />
              </Typography>
              <Typography align="center">{weather.conditionText}</Typography>
              <Typography align="center" variant="h4">
                🌡️ {convertTemp(weather.tempC)}°
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}><Typography>🔽 Mín: {convertTemp(weather.tempMinC)}°</Typography></Grid>
                <Grid item xs={6}><Typography>🔼 Máx: {convertTemp(weather.tempMaxC)}°</Typography></Grid>
                <Grid item xs={6}><Typography>💨 Sensación: {convertTemp(weather.feelsLikeC)}°</Typography></Grid>
                <Grid item xs={6}><Typography>💧 Humedad: {weather.humidity}%</Typography></Grid>
                <Grid item xs={12}><Typography>⚖️ Presión: {weather.pressure} hPa</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Typography
          textAlign="center"
          sx={{ mt: 2, fontSize: "10px"}}
        >
          Powered by:{" "}
          <a
            href="https://openweathermap.org/"
            title="Open Weather Map"
          >
            OpenWeatherMap.com
          </a>
        </Typography>
      </Container>
    </Box>
  );
}
