import React from "react";
import Head from "next/head";
import { Client } from "pg";
import PropTypes from "prop-types";

import Stats from "../components/stats/Stats";
// import axios from "axios";

// StatsPage.getInitialProps = async () => {
export const getServerSideProps = async () => {
  // runs in server side
  // const url = "https://pvx-api-vercel.vercel.app/api/gcount";
  // let { data } = await axios.get(url);
  // return { gcount: data.data };

  const proConfig = {
    connectionString: process.env.HEROKU_PG,
    ssl: {
      rejectUnauthorized: false,
    },
  };
  const client = new Client(proConfig);
  await client.connect();

  let dataPVXG;
  let dataPVXT;

  const resultPVXG = await client.query(
    "SELECT groupname.gname,groupname.groupjid,SUM(countmember.count) as count from countmember INNER JOIN groupname ON countmember.groupjid = groupname.groupjid GROUP BY groupname.gname,groupname.groupjid ORDER BY count DESC;"
  );

  if (resultPVXG.rowCount) {
    dataPVXG = resultPVXG.rows;
  } else {
    dataPVXG = [];
  }

  const resultPVXT = await client.query(
    "SELECT countmembername.name,countmember.memberjid,sum(countmember.count) as count FROM countmember LEFT JOIN countmembername ON countmember.memberjid=countmembername.memberjid GROUP BY countmember.memberjid,countmembername.name ORDER BY count DESC LIMIT 50;"
  );
  await client.end();

  if (resultPVXT.rowCount) {
    dataPVXT = resultPVXT.rows;
  } else {
    dataPVXT = [];
  }

  return { props: { dataPVXG, dataPVXT } };
};

export default function StatsPage({ dataPVXG, dataPVXT }) {
  return (
    <>
      <Head>
        <title>PVX | STATS</title>
      </Head>
      <Stats dataPVXG={dataPVXG} dataPVXT={dataPVXT} />
    </>
  );
}

StatsPage.propTypes = {
  dataPVXG: PropTypes.PropTypes.arrayOf(
    PropTypes.shape({
      gname: PropTypes.string.isRequired,
      groupjid: PropTypes.string.isRequired,
      count: PropTypes.string.isRequired,
    })
  ).isRequired,
  dataPVXT: PropTypes.PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      memberjid: PropTypes.string.isRequired,
      count: PropTypes.string.isRequired,
    })
  ).isRequired,
};
