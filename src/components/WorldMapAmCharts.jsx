import React, { useLayoutEffect, useRef, useState } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { Globe, Map as MapIcon, Plane, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';
import { ROUTE_COLORS } from '../utils/geoCoordinates';
import { useTheme } from '../context/ThemeContext';

export function WorldMapAmCharts({
  visitedCountries = new Map(),
  onSelectCountry,
  selectedCountryCode,
  flightRoutes = [],
  activeFlightId = null,
  onSelectFlight
}) {
  const { isDark } = useTheme();
  const chartRef = useRef(null);
  const rootRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [projectionType, setProjectionType] = useState('geoEqualEarth'); // 'geoEqualEarth' | 'geoOrthographic'
  const [showFlights, setShowFlights] = useState(true);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    // 1. Crear Root de amCharts 5
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Remover logo de evaluación si se renderiza
    if (root._logo) {
      root._logo.dispose();
    }

    // 2. Aplicar temas amCharts según el modo (oscuro o animado estándar)
    root.setThemes(
      isDark
        ? [am5themes_Animated.new(root), am5themes_Dark.new(root)]
        : [am5themes_Animated.new(root)]
    );

    // 3. Crear MapChart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'rotateX',
        panY: projectionType === 'geoOrthographic' ? 'rotateY' : 'translateY',
        projection: projectionType === 'geoOrthographic' ? am5map.geoOrthographic() : am5map.geoEqualEarth(),
        homeGeoPoint: { latitude: 15, longitude: 0 },
        homeZoomLevel: 1
      })
    );
    chartInstanceRef.current = chart;

    // Fondo del océano en modo Globo 3D
    if (projectionType === 'geoOrthographic') {
      const backgroundSeries = chart.series.unshift(
        am5map.MapPolygonSeries.new(root, {})
      );
      backgroundSeries.mapPolygons.template.setAll({
        fill: isDark ? am5.color(0x07090E) : am5.color(0xEFF6FF),
        stroke: isDark ? am5.color(0x1C2436) : am5.color(0xCBD5E1),
        strokeWidth: 1
      });
      backgroundSeries.data.push({
        geometry: am5map.getGeoRectangle(90, 180, -90, -180)
      });
    }

    // 4. Crear MapPolygonSeries para los países
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ['AQ'] // Excluir Antártida para mejor visualización
      })
    );

    // Configuración base de polígonos (países sin visitar)
    polygonSeries.mapPolygons.template.setAll({
      tooltipHTML: `
        <div style="background: ${isDark ? '#0E121B' : '#FFFFFF'}; border: 1px solid ${isDark ? '#1C2436' : '#CBD5E1'}; padding: 8px 12px; border-radius: 8px; color: ${isDark ? '#F1F5F9' : '#0F172A'}; font-family: sans-serif; font-size: 12px; box-shadow: 0 10px 25px rgba(0,0,0,${isDark ? '0.5' : '0.1'});">
          <div style="font-weight: bold; margin-bottom: 2px;">{name} ({id})</div>
          <div style="color: ${isDark ? '#8492A6' : '#64748B'}; font-size: 10px;">Por explorar</div>
        </div>
      `,
      fill: isDark ? am5.color(0x151B27) : am5.color(0xF1F5F9),
      stroke: isDark ? am5.color(0x1C2436) : am5.color(0xCBD5E1),
      strokeWidth: 0.6,
      fillOpacity: 1,
      interactive: true,
      templateField: "polygonSettings"
    });

    // Adapters de garantía total: PINTAR EL PAÍS VISITADO DE COLOR
    polygonSeries.mapPolygons.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          return id === selectedCountryCode ? am5.color(0xFFE500) : am5.color(0x00FF85);
        }
      }
      return fill;
    });

    polygonSeries.mapPolygons.template.adapters.add('stroke', (stroke, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          return id === selectedCountryCode ? am5.color(0xFFE500) : am5.color(0x00FF85);
        }
      }
      return stroke;
    });

    polygonSeries.mapPolygons.template.adapters.add('strokeWidth', (strokeWidth, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          return 1.4;
        }
      }
      return strokeWidth;
    });

    polygonSeries.mapPolygons.template.adapters.add('fillOpacity', (fillOpacity, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          return 0.9;
        }
      }
      return fillOpacity;
    });

    // Tooltip adapter para mostrar siempre la bandera y detalles si está visitado
    polygonSeries.mapPolygons.template.adapters.add('tooltipHTML', (tooltipHTML, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          const info = visitedCountries.get(id);
          const tripCount = info.viajes?.length || 1;
          const tripTitles = info.viajes?.map((v) => v.titulo).join('<br/>• ') || '';
          return `
            <div style="background: ${isDark ? '#0E121B' : '#FFFFFF'}; border: 1.5px solid ${isDark ? '#00FF85' : '#059669'}; padding: 10px 14px; border-radius: 8px; color: ${isDark ? '#F1F5F9' : '#0F172A'}; font-family: sans-serif; font-size: 12px; box-shadow: 0 10px 25px rgba(0,255,133,${isDark ? '0.3' : '0.15'});">
              <div style="font-size: 16px; margin-bottom: 4px;">${info.flag || '🌍'} <span style="font-weight: bold; color: ${isDark ? '#00FF85' : '#059669'};">${info.es || info.en || id}</span></div>
              <div style="background: ${isDark ? 'rgba(0,255,133,0.2)' : 'rgba(5,150,105,0.15)'}; color: ${isDark ? '#00FF85' : '#059669'}; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">
                ✓ PAÍS VISITADO (${tripCount} ${tripCount === 1 ? 'viaje' : 'viajes'})
              </div>
              ${info.motivo ? `<div style="color: ${isDark ? '#00E5FF' : '#0284C7'}; font-size: 10px; margin-bottom: 4px;">• ${info.motivo}</div>` : ''}
              ${tripTitles ? `<div style="color: ${isDark ? '#CBD5E1' : '#334155'}; font-size: 11px; line-height: 1.4;">• ${tripTitles}</div>` : ''}
            </div>
          `;
        }
      }
      return tooltipHTML;
    });

    // Estado Hover de países
    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: isDark ? am5.color(0x242F45) : am5.color(0xE2E8F0),
      stroke: isDark ? am5.color(0x00E5FF) : am5.color(0x0284C7),
      strokeWidth: 1.2
    });

    // 5. Mapear datos de países visitados con colores neón sólidos
    const data = [];
    if (visitedCountries instanceof Map) {
      visitedCountries.forEach((info, code) => {
        const isSelected = selectedCountryCode === code;
        const tripCount = info.viajes?.length || 1;
        const tripTitles = info.viajes?.map((v) => v.titulo).join('<br/>• ') || '';

        data.push({
          id: code,
          polygonSettings: {
            fill: isSelected ? am5.color(0xFFE500) : am5.color(0x00FF85),
            stroke: isSelected ? am5.color(0xFFE500) : am5.color(0x00FF85),
            strokeWidth: 1.4,
            fillOpacity: 0.9
          }
        });
      });
    }
    polygonSeries.data.setAll(data);

    // Evento de clic en país
    polygonSeries.mapPolygons.template.events.on('click', (ev) => {
      const dataItem = ev.target.dataItem;
      if (dataItem && onSelectCountry) {
        const id = dataItem.get('id');
        const info = visitedCountries.get(id);
        onSelectCountry(id, info);
      }
    });

    // 6. RENDERIZAR TRAYECTOS DE VUELO (Líneas, Marcadores de Origen/Destino y Avión Animado)
    if (showFlights && Array.isArray(flightRoutes) && flightRoutes.length > 0) {
      // 6.1. Series de Líneas de Trayecto
      const lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
      lineSeries.mapLines.template.setAll({
        stroke: am5.color(0x00E5FF),
        strokeWidth: 2.6,
        strokeOpacity: 0.9,
        strokeDasharray: [6, 4],
        tooltipHTML: `
          <div style="background: ${isDark ? '#0E121B' : '#FFFFFF'}; border: 1.5px solid {routeColorHex}; padding: 8px 12px; border-radius: 8px; color: ${isDark ? '#F1F5F9' : '#0F172A'}; font-family: sans-serif; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,${isDark ? '0.6' : '0.12'});">
            <div style="font-weight: bold; color: {routeColorHex}; font-size: 12px; margin-bottom: 2px;">
              ✈️ {flightTitle}
            </div>
            <div style="color: ${isDark ? '#CBD5E1' : '#334155'}; font-size: 11px;">{originName} ➔ {destName}</div>
            <div style="display: inline-block; margin-top: 4px; padding: 2px 6px; background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}; border-radius: 4px; font-size: 9px; font-weight: bold; color: {routeColorHex};">
              {tramoBadge}
            </div>
          </div>
        `
      });

      // Adapter para pintar CADA TRAYECTO con su color individual asignado
      lineSeries.mapLines.template.adapters.add('stroke', (stroke, target) => {
        const dataItem = target.dataItem;
        if (dataItem?.dataContext?.routeAmColor) {
          return dataItem.dataContext.routeAmColor;
        }
        return stroke;
      });

      // 6.2. Series de Puntos (Marcadores de Origen, Escala y Destino)
      const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

      pointSeries.bullets.push(function (root, series, dataItem) {
        const ctx = dataItem.dataContext || {};
        const isOrigin = ctx.pointType === 'origin';
        const isConn = ctx.pointType === 'connection';
        const isDest = ctx.pointType === 'destination';
        const routeAmColor = ctx.routeAmColor || am5.color(0x00E5FF);
        const routeColorHex = ctx.routeColorHex || '#00E5FF';

        // Verde Neón para Origen, Amarillo para Escala, y el color del trayecto para Destino
        const markerColor = isOrigin
          ? am5.color(0x00FF85)
          : isConn
          ? am5.color(0xFFE500)
          : routeAmColor;

        const borderHex = isOrigin ? '#00FF85' : isConn ? '#FFE500' : routeColorHex;
        const iconPrefix = isOrigin ? '🛫 ' : isConn ? '🔄 ' : '🛬 ';

        const container = am5.Container.new(root, {
          cursorOverStyle: 'pointer',
          tooltipHTML: `
            <div style="background: ${isDark ? '#0E121B' : '#FFFFFF'}; border: 1.5px solid ${borderHex}; padding: 8px 12px; border-radius: 8px; color: ${isDark ? '#F1F5F9' : '#0F172A'}; font-family: sans-serif; font-size: 11px; box-shadow: 0 8px 20px rgba(0,0,0,${isDark ? '0.6' : '0.12'});">
              <div style="font-weight: bold; color: ${borderHex}; font-size: 12px; margin-bottom: 2px;">
                ${iconPrefix} ${isOrigin ? 'ORIGEN' : isConn ? 'ESCALA / CONEXIÓN' : 'DESTINO'}: ${ctx.title || ''}
              </div>
              <div style="color: ${isDark ? '#CBD5E1' : '#334155'}; font-size: 10px;">${ctx.subtitle || ''}</div>
              <div style="color: ${isDark ? '#8492A6' : '#64748B'}; font-size: 10px; margin-top: 4px;">Vuelo: ${ctx.flightTitle || ''}</div>
              ${ctx.tramoBadge ? `<div style="display: inline-block; margin-top: 4px; padding: 2px 6px; background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; border-radius: 4px; font-size: 9px; font-weight: bold; color: ${borderHex};">${ctx.tramoBadge}</div>` : ''}
            </div>
          `
        });

        // Halo exterior brillante con color del tramo
        container.children.push(
          am5.Circle.new(root, {
            radius: isOrigin || isDest ? 10 : 8,
            fill: markerColor,
            fillOpacity: 0.25,
            stroke: markerColor,
            strokeWidth: 1.2,
            strokeOpacity: 0.8
          })
        );

        // Círculo central sólido
        container.children.push(
          am5.Circle.new(root, {
            radius: isOrigin || isDest ? 5 : 4,
            fill: markerColor,
            stroke: am5.color(0x080A0F),
            strokeWidth: 1.5
          })
        );

        // Etiqueta con nombre de ciudad o aeropuerto
        if (ctx.label) {
          const bgRect = am5.RoundedRectangle.new(root, {
            fill: am5.color(0x0A0D14),
            fillOpacity: 0.92,
            stroke: markerColor,
            strokeWidth: 0.8,
            cornerRadiusTL: 4,
            cornerRadiusTR: 4,
            cornerRadiusBL: 4,
            cornerRadiusBR: 4
          });

          container.children.push(
            am5.Label.new(root, {
              text: `${iconPrefix}${ctx.label}`,
              fill: am5.color(0xF1F5F9),
              fontSize: 10,
              fontWeight: '700',
              centerY: am5.p50,
              centerX: am5.p0,
              dx: 12,
              background: bgRect,
              paddingTop: 2,
              paddingBottom: 2,
              paddingLeft: 5,
              paddingRight: 5
            })
          );
        }

        return am5.Bullet.new(root, { sprite: container });
      });

      // 6.3. Series de Aviones Animados
      const planeSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

      planeSeries.bullets.push(function (root, series, dataItem) {
        const container = am5.Container.new(root, {});
        const plane = am5.Graphics.new(root, {
          svgPath:
            'm2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47',
          scale: 0.055,
          centerY: am5.p50,
          centerX: am5.p50,
          fill: am5.color(0x00E5FF),
          stroke: am5.color(0x080A0F),
          strokeWidth: 1
        });

        // Guardar referencia del sprite para poder ajustar su orientación según el sentido de vuelo
        dataItem.planeGraphic = plane;

        // Adapter para que el avión se pinte con el color asignado a su trayecto
        plane.adapters.add('fill', (fill, target) => {
          const dItem = target.dataItem;
          if (dItem?.dataContext?.routeAmColor) {
            return dItem.dataContext.routeAmColor;
          }
          return fill;
        });

        container.children.push(plane);
        return am5.Bullet.new(root, { sprite: container });
      });

      // Set para asegurar que solo exista UN avión por cada round trip completo
      const animatedRoundTripGroups = new Set();

      // Iterar rutas de vuelo y conectarlas con sus colores individuales
      flightRoutes.forEach((route, idx) => {
        if (!route.origin || !route.destination) return;

        const routeColorHex = route.color || ROUTE_COLORS[idx % ROUTE_COLORS.length].hex;
        const routeAmColor = am5.color(routeColorHex);
        const isRoundTrip = route.tipoTrayecto === 'round-trip' || route.esRoundTrip;
        const tramoBadge = isRoundTrip
          ? (route.tramo === 'regreso' ? '🔄 Round-Trip • Regreso 🛬' : '🔄 Round-Trip • Ida 🛫')
          : '➡️ One-Way • Solo Ida';

        const points = [];

        // 1. Punto Origen
        const originPoint = pointSeries.pushDataItem({
          latitude: route.origin.latitude,
          longitude: route.origin.longitude
        });
        originPoint.dataContext = {
          pointType: 'origin',
          label: route.origin.airportName || route.origin.city,
          title: route.origin.displayTitle,
          subtitle: `${route.origin.city || ''} ${route.origin.country ? `(${route.origin.country})` : ''}`,
          flightTitle: route.titulo,
          routeAmColor,
          routeColorHex,
          tramoBadge
        };
        points.push(originPoint);

        // 2. Punto Conexión / Escala (si existe)
        if (route.connection) {
          const connPoint = pointSeries.pushDataItem({
            latitude: route.connection.latitude,
            longitude: route.connection.longitude
          });
          connPoint.dataContext = {
            pointType: 'connection',
            label: route.connection.airportName || route.connection.city,
            title: route.connection.displayTitle,
            subtitle: `${route.connection.city || ''} ${route.connection.country ? `(${route.connection.country})` : ''}`,
            flightTitle: route.titulo,
            routeAmColor,
            routeColorHex,
            tramoBadge
          };
          points.push(connPoint);
        }

        // 3. Punto Destino
        const destPoint = pointSeries.pushDataItem({
          latitude: route.destination.latitude,
          longitude: route.destination.longitude
        });
        destPoint.dataContext = {
          pointType: 'destination',
          label: route.destination.airportName || route.destination.city,
          title: route.destination.displayTitle,
          subtitle: `${route.destination.city || ''} ${route.destination.country ? `(${route.destination.country})` : ''}`,
          flightTitle: route.titulo,
          routeAmColor,
          routeColorHex,
          tramoBadge
        };
        points.push(destPoint);

        // Conectar puntos con la línea curva geodésica
        const lineDataItem = lineSeries.pushDataItem({
          pointsToConnect: points
        });

        // Configurar tooltip de la línea de vuelo con su color de trayecto
        lineDataItem.dataContext = {
          flightTitle: route.titulo,
          originName: route.origin.displayTitle,
          destName: route.destination.displayTitle,
          hasConn: Boolean(route.connection),
          connName: route.connection?.displayTitle || '',
          routeAmColor,
          routeColorHex,
          tramoBadge
        };

        // Identificador del par de ciudades del round trip (ej: "MAD<->MDE")
        const endpointsKey = [
          route.origin?.code || route.origin?.displayTitle,
          route.destination?.code || route.destination?.displayTitle
        ].filter(Boolean).sort().join('<->');

        const roundTripKey = route.roundTripGroupId || (isRoundTrip ? endpointsKey : null);

        // REGLA: Sólo un avión animado por todo el round trip al que corresponde
        let shouldSpawnPlane = true;
        if (roundTripKey) {
          if (animatedRoundTripGroups.has(roundTripKey)) {
            shouldSpawnPlane = false;
          } else {
            animatedRoundTripGroups.add(roundTripKey);
          }
        }

        // Animación continua del avión volando a lo largo del trayecto
        if (shouldSpawnPlane) {
          const planeDataItem = planeSeries.pushDataItem({
            lineDataItem: lineDataItem,
            positionOnLine: 0,
            autoRotate: true
          });

          planeDataItem.dataContext = {
            routeAmColor,
            routeColorHex
          };

          // Mantener la punta del avión apuntando siempre hacia el sentido de avance
          // Cuando la animación regresa (yoyo) hacia el origen, se rota 180° para evitar que vuele de reversa
          let isReturning = false;
          let prevPosition = 0;

          planeDataItem.on('positionOnLine', function (value) {
            const targetPlane =
              planeDataItem.planeGraphic ||
              planeDataItem.bullets?.[0]?.get('sprite')?.children?.values?.[0];

            if (!targetPlane) return;

            const step = value - prevPosition;
            if (Math.abs(step) < 0.5) {
              if (step < 0 && !isReturning) {
                isReturning = true;
                targetPlane.set('rotation', 180);
              } else if (step > 0 && isReturning) {
                isReturning = false;
                targetPlane.set('rotation', 0);
              }
            }
            prevPosition = value;
          });

          // Velocidad más lenta y elegante (24 a 30 segundos por trayecto completo)
          planeDataItem.animate({
            key: 'positionOnLine',
            to: 1,
            duration: 24000 + (idx % 3) * 3000,
            loops: Infinity,
            easing: am5.ease.yoyo(am5.ease.linear)
          });
        }
      });
    }

    // Control de Zoom integrado de amCharts
    const zoomControl = chart.set('zoomControl', am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set('visible', true);

    return () => {
      root.dispose();
    };
  }, [visitedCountries, projectionType, selectedCountryCode, onSelectCountry, flightRoutes, showFlights, isDark]);

  // Manejador para enfocar una ruta de vuelo específica
  const handleFocusRoute = (route) => {
    if (!chartInstanceRef.current || !route) return;
    const chart = chartInstanceRef.current;
    const midLat = (route.origin.latitude + route.destination.latitude) / 2;
    const midLon = (route.origin.longitude + route.destination.longitude) / 2;
    chart.zoomToGeoPoint({ latitude: midLat, longitude: midLon }, 2.5, true, 1000);
  };

  return (
    <div className="relative w-full max-w-full bg-[#0E121B] border border-[#1C2436] rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* Cabecera del mapa interactivo con amCharts 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 sm:px-4 py-3 border-b border-[#1C2436] bg-[#0A0D14]">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00FF85] shrink-0 mt-0.5 sm:mt-0 shadow-sm">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F1F5F9] m-0 leading-tight">
                Mapa Mundi de Viajes y Rutas Aéreas
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 whitespace-nowrap leading-none inline-flex items-center">
                  amCharts 5
                </span>
                {flightRoutes.length > 0 && (
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/40 inline-flex items-center gap-1 whitespace-nowrap leading-none">
                    <Plane className="w-3 h-3 shrink-0" />
                    <span>{flightRoutes.length} {flightRoutes.length === 1 ? 'Trayecto' : 'Trayectos'}</span>
                  </span>
                )}
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#8492A6] m-0 mt-0.5 leading-snug">
              Países visitados iluminados con líneas de trayecto aéreo entre origen y destino
            </p>
          </div>
        </div>

        {/* Acciones y Selectores */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón para alternar visibilidad de vuelos */}
          {flightRoutes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFlights(!showFlights)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 border ${
                showFlights
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-[#151B27] text-[#8492A6] border-[#1C2436] hover:text-[#F1F5F9]'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>{showFlights ? 'Ocultar Trayectos' : 'Ver Trayectos'}</span>
            </button>
          )}

          {/* Selector de Proyección (Plano vs Globo 3D) */}
          <div className="flex items-center gap-1 bg-[#151B27] p-1 rounded-lg border border-[#1C2436]">
            <button
              type="button"
              onClick={() => setProjectionType('geoEqualEarth')}
              className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
                projectionType === 'geoEqualEarth'
                  ? 'bg-[#0E121B] text-[#00FF85] border border-[#00FF85]/30'
                  : 'text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Mapa Plano</span>
            </button>
            <button
              type="button"
              onClick={() => setProjectionType('geoOrthographic')}
              className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
                projectionType === 'geoOrthographic'
                  ? 'bg-[#0E121B] text-[#00E5FF] border border-[#00E5FF]/30'
                  : 'text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Globo 3D</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Div del Mapa amCharts 5 */}
      <div
        ref={chartRef}
        className="w-full h-[360px] sm:h-[460px] md:h-[540px] lg:h-[600px] xl:h-[660px] bg-[#07090E] max-w-full overflow-hidden"
      />

      {/* Barra de Rutas de Vuelo Registradas (Pills interactivos con colores por trayecto) */}
      {showFlights && flightRoutes.length > 0 && (
        <div className="px-3 sm:px-4 py-2.5 bg-[#0D111A] border-t border-[#1C2436] flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
          <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider shrink-0 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#00E5FF]" /> Trayectos:
          </span>
          {flightRoutes.map((route, idx) => {
            const colorHex = route.color || ROUTE_COLORS[idx % ROUTE_COLORS.length].hex;
            const isRoundTrip = route.tipoTrayecto === 'round-trip' || route.esRoundTrip;
            const tramoLabel = isRoundTrip
              ? (route.tramo === 'regreso' ? 'Vuelta 🛬' : 'Ida 🛫')
              : 'Solo Ida';

            return (
              <button
                key={route.id}
                onClick={() => handleFocusRoute(route)}
                style={{ borderColor: `${colorHex}50` }}
                className="px-2.5 py-1 bg-[#151B27] hover:bg-[#1E2738] border rounded-md text-[11px] text-[#F1F5F9] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm group"
                title={`${route.titulo} (${tramoLabel})`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                  style={{ backgroundColor: colorHex }}
                />
                <span
                  className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded"
                  style={{ backgroundColor: `${colorHex}20`, color: colorHex }}
                >
                  {tramoLabel}
                </span>
                <span className="font-bold text-[#F1F5F9]">
                  {route.origin.airportName || route.origin.city}
                </span>
                <span className="font-black" style={{ color: colorHex }}>➔</span>
                {route.connection && (
                  <>
                    <span className="text-[#FFE500] font-semibold text-[10px]">
                      via {route.connection.airportName || route.connection.city}
                    </span>
                    <span className="font-black" style={{ color: colorHex }}>➔</span>
                  </>
                )}
                <span className="font-bold" style={{ color: colorHex }}>
                  {route.destination.airportName || route.destination.city}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Leyenda y Estadísticas */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0A0D14] border-t border-[#1C2436] text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#00FF85] border border-[#00FF85]" />
            <span className="text-[#F1F5F9] font-semibold text-[11px]">País Visitado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#151B27] border border-[#1C2436]" />
            <span className="text-[#8492A6] text-[11px]">Por explorar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#FFE500] border border-[#FFE500]" />
            <span className="text-[#8492A6] text-[11px]">Selección / Escala</span>
          </div>
          {flightRoutes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-t-2 border-dashed border-[#00E5FF]" />
              <span className="text-[#00E5FF] font-bold text-[11px] flex items-center gap-1">
                <Plane className="w-3 h-3" /> Trayecto de Vuelo
              </span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#8492A6]">
          Países visitados:{' '}
          <span className="font-bold text-[#00FF85] text-xs">
            {visitedCountries.size}
          </span>{' '}
          de <span className="font-semibold text-[#F1F5F9]">195</span> ({((visitedCountries.size / 195) * 100).toFixed(1)}% del mundo)
        </div>
      </div>
    </div>
  );
}

export default WorldMapAmCharts;
