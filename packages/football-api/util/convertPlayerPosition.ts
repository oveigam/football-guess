import { Position } from ".prisma/client";
import { ApiPlayerPosition } from "../football-api";

export function convertPlayerPosition(position: ApiPlayerPosition) {
  switch (position) {
    case "Goalkeeper":
      return Position.Goalkeeper;
    case "Left Winger":
    case "Right Winger":
    case "Centre-Forward":
    case "Offence":
    case "Striker":
      return Position.Offence;
    case "Centre-Back":
    case "Right-Back":
    case "Left-Back":
    case "Defence":
      return Position.Defence;
    case "Central Midfield":
    case "Attacking Midfield":
    case "Defensive Midfield":
    case "Right Midfield":
    case "Left Midfield":
    case "Midfield":
      return Position.Midfield;
  }
}
