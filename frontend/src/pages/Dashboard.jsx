import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import WeatherCard from '../components/WeatherCard';
import PlantGrowthCard from '../components/PlantGrowthCard';
import GreenhouseVisual from '../components/GreenhouseVisual';
import ProductionSummary from '../components/ProductionSummary';
import VerticalFarmFeature from '../components/VerticalFarmFeature';
import DiseaseAlert from '../components/DiseaseAlert';
import { 
  getFarmData, 
  getSensorReadings, 
  getWeather, 
  getDiseaseDetections, 
  getProductionData 
} from '../services/api';

const Dashboard = () => {
  const [farmData, setFarmData] = useState(null);
  const [sensors, setSensors] = useState(null);
  const [weather, setWeather] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [farmRes, sensorRes, weatherRes, diseaseRes, prodRes] = await Promise.all([
          getFarmData(),
          getSensorReadings(),
          getWeather(),
          getDiseaseDetections(),
          getProductionData()
        ]);
        setFarmData(farmRes);
        setSensors(sensorRes);
        setWeather(weatherRes);
        setDiseases(diseaseRes);
        setProduction(prodRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1700px] w-full">
      <Header farmData={farmData} />

      {/* Disease Alerts Row */}
      {diseases.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {diseases.map(disease => (
            <DiseaseAlert key={disease.id} data={disease} />
          ))}
        </div>
      )}

      {/* TopGridSection */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-12 lg:col-span-4 flex flex-col">
          <WeatherCard weather={weather} sensors={sensors} />
        </div>
        <div className="md:col-span-12 lg:col-span-4 flex flex-col">
          <PlantGrowthCard />
        </div>
        <div className="md:col-span-12 lg:col-span-4 flex flex-col">
          <GreenhouseVisual />
        </div>
      </section>

      {/* BottomGridSection */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <ProductionSummary data={production} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <VerticalFarmFeature />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
