import { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldHigh from '@amcharts/amcharts5-geodata/worldHigh';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { ROUTE_COLORS } from '../../utils/geoCoordinates';
import { getCountryPaletteColor } from './palette';

export function useAmChartsMap({
  visitedCountries = new Map(),
  onSelectCountry,
  selectedCountryCode,
  flightRoutes = [],
  showFlightsInternal,
  multiColor = false,
  projectionType,
  resolvedLocalGeoPoint,
  isDark
}) {
  const chartRef = useRef(null);
  const rootRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    // 1. Crear Root de amCharts 5
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    if (root._logo) {
      root._logo.dispose();
    }

    // 2. Aplicar temas amCharts
    root.setThemes(
      isDark
        ? [am5themes_Animated.new(root), am5themes_Dark.new(root)]
        : [am5themes_Animated.new(root)]
    );

    // 3. Crear MapChart centrado siempre en el país local
    const is3D = projectionType === 'geoOrthographic';
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'rotateX',
        panY: is3D ? 'rotateY' : 'translateY',
        projection: is3D ? am5map.geoOrthographic() : am5map.geoEqualEarth(),
        rotationX: is3D ? -resolvedLocalGeoPoint.longitude : 0,
        rotationY: is3D ? -resolvedLocalGeoPoint.latitude : 0,
        homeGeoPoint: resolvedLocalGeoPoint,
        homeZoomLevel: is3D ? 1.15 : 1.25
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

    // 4. Crear MapPolygonSeries para los países (usando worldHigh para incluir islas como Jeju, Okinawa, Baleares/Canarias, etc.)
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldHigh,
        exclude: ['AQ']
      })
    );

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

    polygonSeries.mapPolygons.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          const info = visitedCountries.get(id);
          if (info?.isPending) {
            return isDark ? am5.color(0x151B27) : am5.color(0xF1F5F9);
          }
          if (id === selectedCountryCode) return am5.color(0xFFE500);
          return multiColor ? am5.color(getCountryPaletteColor(id).am) : am5.color(0x00FF85);
        }
      }
      return fill;
    });

    polygonSeries.mapPolygons.template.adapters.add('stroke', (stroke, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          const info = visitedCountries.get(id);
          if (id === selectedCountryCode) {
            return am5.color(0xFFE500);
          }
          if (info?.isPending) {
            return am5.color(0x00E5FF);
          }
          return multiColor ? am5.color(getCountryPaletteColor(id).am) : am5.color(0x00FF85);
        }
      }
      return stroke;
    });

    polygonSeries.mapPolygons.template.adapters.add('strokeWidth', (strokeWidth, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          const info = visitedCountries.get(id);
          if (info?.isPending) {
            return 2.2;
          }
          return 1.4;
        }
      }
      return strokeWidth;
    });

    polygonSeries.mapPolygons.template.adapters.add('strokeDasharray', (strokeDasharray, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          const info = visitedCountries.get(id);
          if (info?.isPending) {
            return [5, 3];
          }
        }
      }
      return undefined;
    });

    polygonSeries.mapPolygons.template.adapters.add('fillOpacity', (fillOpacity, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          const info = visitedCountries.get(id);
          if (info?.isPending) {
            return 1;
          }
          return 0.9;
        }
      }
      return fillOpacity;
    });

    polygonSeries.mapPolygons.template.adapters.add('tooltipHTML', (tooltipHTML, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const id = dataItem.get('id');
        if (visitedCountries instanceof Map && visitedCountries.has(id)) {
          const info = visitedCountries.get(id);
          const tripCount = info.viajes?.length || 1;
          const tripTitles = info.viajes?.map((v) => v.titulo).join('<br/>• ') || '';

          if (info.isPending) {
            return `
              <div style="background: ${isDark ? '#0E121B' : '#FFFFFF'}; border: 1.5px solid ${isDark ? '#00E5FF' : '#0284C7'}; padding: 10px 14px; border-radius: 8px; color: ${isDark ? '#F1F5F9' : '#0F172A'}; font-family: sans-serif; font-size: 12px; box-shadow: 0 10px 25px rgba(0,229,255,${isDark ? '0.25' : '0.12'});">
                <div style="font-size: 16px; margin-bottom: 4px;">${info.flag || '🌍'} <span style="font-weight: bold; color: ${isDark ? '#00E5FF' : '#0284C7'};">${info.es || info.en || id}</span></div>
                <div style="background: ${isDark ? 'rgba(0,229,255,0.15)' : 'rgba(2,132,199,0.12)'}; color: ${isDark ? '#00E5FF' : '#0284C7'}; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">
                  ⏳ RUTA PENDIENTE (Sin vuelos registrados)
                </div>
                ${info.motivo ? `<div style="color: ${isDark ? '#CBD5E1' : '#334155'}; font-size: 10px; margin-bottom: 4px;">• ${info.motivo}</div>` : ''}
                ${tripTitles ? `<div style="color: ${isDark ? '#8492A6' : '#64748B'}; font-size: 10px; line-height: 1.4;">Viaje: ${tripTitles}</div>` : ''}
                <div style="color: ${isDark ? '#64748B' : '#94A3B8'}; font-size: 9px; margin-top: 5px; font-style: italic;">Se pintará al registrar los vuelos o trayectos correspondientes.</div>
              </div>
            `;
          }

          const palette = getCountryPaletteColor(id);
          const colorHex = multiColor ? palette.hex : (isDark ? '#00FF85' : '#059669');

          return `
            <div style="background: ${isDark ? '#0E121B' : '#FFFFFF'}; border: 1.5px solid ${colorHex}; padding: 10px 14px; border-radius: 8px; color: ${isDark ? '#F1F5F9' : '#0F172A'}; font-family: sans-serif; font-size: 12px; box-shadow: 0 10px 25px rgba(0,0,0,${isDark ? '0.4' : '0.1'});">
              <div style="font-size: 16px; margin-bottom: 4px;">${info.flag || '🌍'} <span style="font-weight: bold; color: ${colorHex};">${info.es || info.en || id}</span></div>
              <div style="background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}; color: ${colorHex}; border: 1px solid ${colorHex}40; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">
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

    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: isDark ? am5.color(0x242F45) : am5.color(0xE2E8F0),
      stroke: isDark ? am5.color(0x00E5FF) : am5.color(0x0284C7),
      strokeWidth: 1.6
    });

    // 5. Cargar datos de países
    const data = [];
    if (visitedCountries instanceof Map) {
      visitedCountries.forEach((info, code) => {
        const isSelected = selectedCountryCode === code;
        const isPending = Boolean(info.isPending);
        const palette = getCountryPaletteColor(code);
        const countryColor = multiColor ? am5.color(palette.am) : am5.color(0x00FF85);

        data.push({
          id: code,
          polygonSettings: {
            fill: isPending
              ? (isDark ? am5.color(0x151B27) : am5.color(0xF1F5F9))
              : (isSelected ? am5.color(0xFFE500) : countryColor),
            stroke: isSelected
              ? am5.color(0xFFE500)
              : (isPending ? am5.color(0x00E5FF) : countryColor),
            strokeWidth: isPending ? 2.2 : 1.4,
            strokeDasharray: isPending ? [5, 3] : undefined,
            fillOpacity: isPending ? 1 : 0.9
          }
        });
      });
    }
    polygonSeries.data.setAll(data);

    polygonSeries.mapPolygons.template.events.on('click', (ev) => {
      const dataItem = ev.target.dataItem;
      if (dataItem && onSelectCountry) {
        const id = dataItem.get('id');
        const info = visitedCountries.get(id);
        onSelectCountry(id, info);
      }
    });

    // 6. RENDERIZAR TRAYECTOS DE VUELO
    if (showFlightsInternal && Array.isArray(flightRoutes) && flightRoutes.length > 0) {
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

      lineSeries.mapLines.template.adapters.add('stroke', (stroke, target) => {
        const dataItem = target.dataItem;
        if (dataItem?.dataContext?.routeAmColor) {
          return dataItem.dataContext.routeAmColor;
        }
        return stroke;
      });

      const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

      pointSeries.bullets.push(function (root, series, dataItem) {
        const ctx = dataItem.dataContext || {};
        const isOrigin = ctx.pointType === 'origin';
        const isConn = ctx.pointType === 'connection';
        const isDest = ctx.pointType === 'destination';
        const routeAmColor = ctx.routeAmColor || am5.color(0x00E5FF);
        const routeColorHex = ctx.routeColorHex || '#00E5FF';

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

        container.children.push(
          am5.Circle.new(root, {
            radius: isOrigin || isDest ? 5 : 4,
            fill: markerColor,
            stroke: am5.color(0x080A0F),
            strokeWidth: 1.5
          })
        );

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

        dataItem.planeGraphic = plane;

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

      const animatedRoundTripGroups = new Set();
      const renderedAirportLabels = new Set();

      flightRoutes.forEach((route, idx) => {
        if (!route.origin || !route.destination) return;

        const routeColorHex = route.color || ROUTE_COLORS[idx % ROUTE_COLORS.length].hex;
        const routeAmColor = am5.color(routeColorHex);
        const isRoundTrip = route.tipoTrayecto === 'round-trip' || route.esRoundTrip;
        const tramoBadge = isRoundTrip
          ? (route.tramo === 'regreso' ? '🔄 Round-Trip • Regreso 🛬' : '🔄 Round-Trip • Ida 🛫')
          : '➡️ One-Way • Solo Ida';

        const points = [];

        const originLabelKey = `${route.origin.latitude.toFixed(2)},${route.origin.longitude.toFixed(2)}`;
        const showOriginLabel = !renderedAirportLabels.has(originLabelKey);
        renderedAirportLabels.add(originLabelKey);

        const originPoint = pointSeries.pushDataItem({
          latitude: route.origin.latitude,
          longitude: route.origin.longitude
        });
        originPoint.dataContext = {
          pointType: 'origin',
          label: showOriginLabel ? (route.origin.airportName || route.origin.city) : '',
          title: route.origin.displayTitle,
          subtitle: `${route.origin.city || ''} ${route.origin.country ? `(${route.origin.country})` : ''}`,
          flightTitle: route.titulo,
          routeAmColor,
          routeColorHex,
          tramoBadge
        };
        points.push(originPoint);

        if (route.connection) {
          const connLabelKey = `${route.connection.latitude.toFixed(2)},${route.connection.longitude.toFixed(2)}`;
          const showConnLabel = !renderedAirportLabels.has(connLabelKey);
          renderedAirportLabels.add(connLabelKey);

          const connPoint = pointSeries.pushDataItem({
            latitude: route.connection.latitude,
            longitude: route.connection.longitude
          });
          connPoint.dataContext = {
            pointType: 'connection',
            label: showConnLabel ? (route.connection.airportName || route.connection.city) : '',
            title: route.connection.displayTitle,
            subtitle: `${route.connection.city || ''} ${route.connection.country ? `(${route.connection.country})` : ''}`,
            flightTitle: route.titulo,
            routeAmColor,
            routeColorHex,
            tramoBadge
          };
          points.push(connPoint);
        }

        const destLabelKey = `${route.destination.latitude.toFixed(2)},${route.destination.longitude.toFixed(2)}`;
        const showDestLabel = !renderedAirportLabels.has(destLabelKey);
        renderedAirportLabels.add(destLabelKey);

        const destPoint = pointSeries.pushDataItem({
          latitude: route.destination.latitude,
          longitude: route.destination.longitude
        });
        destPoint.dataContext = {
          pointType: 'destination',
          label: showDestLabel ? (route.destination.airportName || route.destination.city) : '',
          title: route.destination.displayTitle,
          subtitle: `${route.destination.city || ''} ${route.destination.country ? `(${route.destination.country})` : ''}`,
          flightTitle: route.titulo,
          routeAmColor,
          routeColorHex,
          tramoBadge
        };
        points.push(destPoint);

        const lineDataItem = lineSeries.pushDataItem({
          pointsToConnect: points
        });

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

        const endpointsKey = [
          route.origin?.code || route.origin?.displayTitle,
          route.destination?.code || route.destination?.displayTitle
        ].filter(Boolean).sort().join('<->');

        const roundTripKey = route.roundTripGroupId || (isRoundTrip ? endpointsKey : null);

        let shouldSpawnPlane = true;
        if (roundTripKey) {
          if (animatedRoundTripGroups.has(roundTripKey)) {
            shouldSpawnPlane = false;
          } else {
            animatedRoundTripGroups.add(roundTripKey);
          }
        }

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

          if (isRoundTrip) {
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

            planeDataItem.animate({
              key: 'positionOnLine',
              from: 0,
              to: 1,
              duration: 24000 + (idx % 3) * 3000,
              loops: Infinity,
              easing: am5.ease.yoyo(am5.ease.linear)
            });
          } else {
            // Trayecto One-Way: solo avanza en dirección Origen ➔ Destino,
            // desaparece al llegar al destino y vuelve a salir desde el origen.
            planeDataItem.on('positionOnLine', function (value) {
              const targetPlane =
                planeDataItem.planeGraphic ||
                planeDataItem.bullets?.[0]?.get('sprite')?.children?.values?.[0];

              if (!targetPlane) return;

              targetPlane.set('rotation', 0);

              if (value <= 0.02 || value >= 0.96) {
                targetPlane.set('opacity', 0);
              } else if (value < 0.08) {
                targetPlane.set('opacity', (value - 0.02) / 0.06);
              } else if (value > 0.88) {
                targetPlane.set('opacity', (0.96 - value) / 0.08);
              } else {
                targetPlane.set('opacity', 1);
              }
            });

            planeDataItem.animate({
              key: 'positionOnLine',
              from: 0,
              to: 1,
              duration: 12000 + (idx % 3) * 2000,
              loops: Infinity,
              easing: am5.ease.linear
            });
          }
        }
      });
    }

    // Control de Zoom
    const zoomControl = chart.set('zoomControl', am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set('visible', true);

    // Enfoque inicial
    chart.events.once('appear', () => {
      chart.zoomToGeoPoint(
        resolvedLocalGeoPoint,
        is3D ? 1.15 : 1.25,
        true,
        800
      );
    });

    const initFocusTimer = setTimeout(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.zoomToGeoPoint(
          resolvedLocalGeoPoint,
          is3D ? 1.15 : 1.25,
          true,
          600
        );
      }
    }, 200);

    return () => {
      clearTimeout(initFocusTimer);
      root.dispose();
    };
  }, [visitedCountries, projectionType, selectedCountryCode, onSelectCountry, flightRoutes, showFlightsInternal, isDark, multiColor, resolvedLocalGeoPoint]);

  const handleFocusRoute = (route) => {
    if (!chartInstanceRef.current || !route) return;
    const chart = chartInstanceRef.current;
    const midLat = (route.origin.latitude + route.destination.latitude) / 2;
    const midLon = (route.origin.longitude + route.destination.longitude) / 2;
    chart.zoomToGeoPoint({ latitude: midLat, longitude: midLon }, 2.5, true, 1000);
  };

  return {
    chartRef,
    handleFocusRoute
  };
}

export default useAmChartsMap;

