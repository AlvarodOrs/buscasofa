import { COMUNIDADES_AUTONOMAS } from '../apis/fuelApiLib';
import React, { useMemo } from 'react';

// @ts-ignore
import './Home.css';


const FUEL_TYPES = [
  { key: 'Precio Gasoleo A', label: 'Gasóleo A' },
  { key: 'Precio Gasolina 95 E5', label: 'Gasolina 95 E5' },
];

/**
 * Calcula el valor medio de un vector de valores formateados como string
 */
function getAverage(values: string[]) {
  const nums = values
    .map(p => parseFloat(p.replace(',', '.')))  // convertir a número
    .filter(n => !isNaN(n));                    // Eliminar inválidos
  if (nums.length === 0) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(3);
}

function getMinMax(regionSummary, fuelKey) {
  const vals = regionSummary
    .map(r => r.fuelPrices.find(f => f.key === fuelKey)?.avg)
    .filter(Boolean)
    .map(Number);
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

const Home = ({ stations }) => {
  // Nacional: medias por tipo de combustible
  const nationalSummary = useMemo(() => {
    return FUEL_TYPES.map(fuel => {
      const prices = stations.map(s => s[fuel.key]);
      const avg = getAverage(prices);
      return { ...fuel, avg };
    }).sort((a, b) => (b.avg && a.avg ? parseFloat(b.avg) - parseFloat(a.avg) : 0));
  }, [stations]);

  // Por comunidad autónoma
  const regionSummary = useMemo(() => {
    return COMUNIDADES_AUTONOMAS.map(region => {
      let regionName = region.name;
      const regionStations = stations.filter(s => s['IDCCAA'] === region.id);
      const fuelPrices = FUEL_TYPES.map(fuel => {
        const prices = regionStations.map(s => s[fuel.key]);
        const avg = getAverage(prices);
        return { ...fuel, avg };
      });
      return { regionName, fuelPrices };
    });
  }, [stations]);

  const minMax = useMemo(() => {
  return Object.fromEntries(
    FUEL_TYPES.map(f => [f.key, getMinMax(regionSummary, f.key)])
  );
  
}, [regionSummary]);
  return (
    <div className="home-container">
      <h1>Buscasofa</h1>
      <div className='description'>
        El mejor buscador de precios de combustible de España.
      </div>

      <h2 className='resumen-nacional'>Resumen nacional de precios</h2>
      <table className='resumen-nacional'>
        <thead>
          <tr>
            <th>Tipo de combustible</th>
            <th>Precio medio (€)</th>
          </tr>
        </thead>
        <tbody>
          {nationalSummary.map(fuel => (
            <tr key={fuel.key}>
              <td>{fuel.label}</td>
              <td>{fuel.avg ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className='resumen-comunidades'>Resumen por comunidad autónoma</h2>
      <table className='resumen-comunidades'>
        <thead>
          <tr>
            <th>Comunidad Autónoma</th>
            {FUEL_TYPES.map(fuel => (
              <th key={fuel.key}>{fuel.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regionSummary.map(region => (
            <tr key={region.regionName}>
              <td>{region.regionName}</td>
              {region.fuelPrices.map(fuel => {
                const val = fuel.avg ? Number(fuel.avg) : null;
                const { min, max } = minMax[fuel.key];
                const color = val === min ? '#b6fcb6' : val === max ? '#ffb3b3' : undefined;
                return (
                  <td key={fuel.key} style={{ backgroundColor: color }}>
                    {fuel.avg ?? 'N/A'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>


    </div>

  )
}

export default Home 