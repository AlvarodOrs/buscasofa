import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import FuelFilters from './FuelFilters';

// @ts-ignore
import './FuelTable.css';

const FuelTable = ({ stations }) => {

  const [pageSize, setPageSize] = useState(20);

  // Filtros
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');

  // Orden
  const [sortField, setSortField] = useState<string>('Rótulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);


  // Provincias y ciudades únicas
  const provinces = useMemo(
    () => Array.from(new Set(stations.map(s => s.Provincia))).sort(),
    [stations]
  );
  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          stations
            .filter(s => !selectedProvince || s.Provincia === selectedProvince)
            .map(s => s.Municipio)
        )
      ).sort(),
    [stations, selectedProvince]
  );

  // Filtrado
  const hasPrice = (val: string) => !!val && val.replace(',', '.') !== '' && val !== '-';
  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      if (!hasPrice(station['Precio Gasoleo A']) && !hasPrice(station['Precio Gasolina 95 E5'])) return false;

      const matchProvince = !selectedProvince || station.Provincia === selectedProvince;
      const matchCity = !selectedCity || station.Municipio === selectedCity;
      const matchFuel = !selectedFuel || hasPrice(station[selectedFuel]);
      return matchProvince && matchCity && matchFuel;
    });
  }, [stations, selectedProvince, selectedCity, selectedFuel]);

  // Ordenación
  const sortedStations = useMemo(() => {
    return [...filteredStations].sort((a, b) => {
      const aRaw = a[sortField] || '';
      const bRaw = b[sortField] || '';

      const aNum = parseFloat(aRaw.replace(',', '.'));
      const bNum = parseFloat(bRaw.replace(',', '.'));
      const isNumeric = !isNaN(aNum) && !isNaN(bNum);

      

      const cmp = isNumeric
        ? aNum - bNum
        : aRaw.localeCompare(bRaw, 'es');
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filteredStations, sortField, sortOrder, selectedFuel]);

  // Paginación
  const totalPages = Math.ceil(sortedStations.length / pageSize);
  const paginatedStations = sortedStations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Cambiar orden
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProvince, selectedCity, selectedFuel]);

  const SortCol = ({ field, label }: { field: string; label: string }) => (
    <th>
      <button className="sortable" onClick={() => handleSort(field)}>
        {label}{' '}
        {sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
      </button>
    </th>
  );

  return (
    <div>
      <h2>Precios de combustibles en gasolineras españolas</h2>
      <FuelFilters
        provinces={provinces}
        cities={cities}
        selectedProvince={selectedProvince}
        selectedCity={selectedCity}
        selectedFuel={selectedFuel}
        onProvinceChange={setSelectedProvince}
        onCityChange={setSelectedCity}
        onFuelChange={setSelectedFuel}
      />
      <label>
        Elementos por página:{' '}
        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </label>
      <table className="fuel-table">
        <thead>
          <tr>
            <SortCol field="Rótulo" label="Gasolinera" />
            <SortCol field="Dirección" label="Dirección" />
            <SortCol field="Municipio" label="Municipio" />
            <SortCol field="Precio Gasoleo A" label="Gasóleo A" />
            <SortCol field="Precio Gasolina 95 E5" label="Gasolina 95 E5" />
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStations.map((station, idx) => (
            <tr key={station.IDEESS || idx}>
              <td>{station['Rótulo']}</td>
              <td>{station['Dirección']}</td>
              <td>{station['Municipio']}</td>
              <td>{station['Precio Gasoleo A']}</td>
              <td>{station['Precio Gasolina 95 E5']}</td>
              <td>
                <Link
                  to={`/station/${station.IDEESS}`}
                  state={{
                    gobackLink: "/lista"
                  }}>
                    Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}> {'<<'}</button>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{'<'}</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>{'>'}</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>{'>>'}</button>
      </div>
    </div>
  );
};

export default FuelTable;