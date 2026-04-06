import { Lot } from '../../models/lot';
import * as baseLotsData from '../data/base-lots.json';

export function loadBaseLots(): Lot[] {
    return baseLotsData as Lot[];
}