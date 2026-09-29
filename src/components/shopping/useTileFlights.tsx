import React, {useCallback, useMemo, useState} from 'react';
import {newClientId} from '../../helper/clientId';
import {PageRect} from '../../helper/measureView';
import {Flight, FlyingTile, TileLook} from './FlyingTile';
import {useTilePositions} from './tilePositions';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const samePlace = (first: PageRect | undefined, second: PageRect | undefined) =>
  first !== undefined && second !== undefined && first.x === second.x && first.y === second.y;

// How long a target may take to be laid out: longer on a phone, where layout comes back from the native side.
const MAX_FRAMES_TO_PLACE = 20;

/** Scrolls a target into view if need be; resolves to where it is then. */
export type Reveal = (target: PageRect) => Promise<PageRect>;

// Copies of tiles flying from one registered tile to another, e.g. onto the list or into recently bought.
export const useTileFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const positions = useTilePositions();
  const moving = useMemo(() => new Set(flights.flatMap((flight) => [flight.sourceKey, flight.targetKey])),
      [flights]);

  const land = useCallback((id: string) =>
    setFlights((current) => current.filter((flight) => flight.id !== id)), []);

  const heading = (id: string, to: Flight['to']) =>
    setFlights((current) => current.map((flight) => flight.id === id ? {...flight, to} : flight));

  // Where the change put the target: the first place other than before that holds for a frame.
  const placed = async (key: string, before: PageRect | undefined) => {
    let last: PageRect | undefined;
    for (let frame = 0; frame < MAX_FRAMES_TO_PLACE; frame++) {
      await nextFrame();
      const rect = await positions.measure(key);
      if (samePlace(rect, last) && !samePlace(rect, before)) {
        return rect;
      }
      last = rect;
    }
    return last;
  };

  // The flight is shown a frame before the change, so a source the change removes is hidden instead of animating out.
  const launch = async (sourceKey: string, targetKey: string, tile: TileLook, change: () => void,
      reveal: Reveal = async (target) => target) => {
    const from = await positions.measure(sourceKey);
    if (!from) {
      change();
      return;
    }
    const before = await positions.measure(targetKey);
    const flight: Flight = {id: newClientId(), sourceKey, targetKey, from, tile};
    setFlights((current) => [...current, flight]);
    await nextFrame();
    change();
    const target = await placed(targetKey, before);
    if (target) {
      heading(flight.id, await reveal(target));
    } else {
      land(flight.id);
    }
  };

  return {
    launch,
    register: positions.register,
    // Hidden and placed without animating while its copy flies from or to it.
    isMoving: (key: string) => moving.has(key),
    copies: flights.map((flight) => <FlyingTile key={flight.id} flight={flight} onLanded={land} />),
  };
};
