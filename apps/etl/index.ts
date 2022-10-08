import { playersEtl } from "./src/etls/players-etl";
import { teamsEtl } from "./src/etls/teams-etl";

async function runEtl() {
  await teamsEtl();
  await playersEtl();
}

runEtl()
  .then(() => {
    console.log("ETL finished!");
  })
  .catch((err) => {
    console.log("ETL ERROR!", err);
  });
