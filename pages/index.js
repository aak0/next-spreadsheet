import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react';

export default function Home() {

  const [data, setData] = useState([
    ["", "LTCUSD", "ETHUSD", "XRPUSD", "XBTUSD", "ETHUSD", "ETHUSD", "ETHUSD"],
    ["2016", 10, 11, 12, 13],
    ["2017", 20, 11, 14, 13],
    ["2018", 30, 15, 12, 13],
    [], [], [], [], [],
    [], [], [], [], [],
    [], [], [], [], [],]
    .map(row => arrPad(undefined, 8, row))
    .map(row => row.map(col => { return { value: col } })));

  const RangeView = ({ cell }) => (
    <input
      type="range"
      value={cell.value}
      disabled
      style={{ pointerEvents: "none" }}
    />
  );

  const RangeEdit = ({ cell, onChange }) => (
    <input
      type="range"
      onChange={(e) => {
        onChange({ ...cell, value: e.target.value });
      }}
      value={cell.value || 0}
      autoFocus
    />
  );

  const [count, setCount] = useState(0);

  useEffect(() => {
    data[1][1] = { value: count };
  }, [data[1][1]]);

  const refreshButton = ({ cell }) => (
    <input
      type="button"
      value="Refresh"
      onClick={(_event) => {
        setCount(count + 1);
      }}
    />
  );
  
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState({});

  const refreshButtonEditor = ({ cell }) => (
    <input
      type="button"
      value="Refresh"
      onClick={(_event) => {
        for (let i = 1; i < data[0].length; i++) {
          const symbol = data[0][i]["value"];
          fetchSymbol(symbol)
            .then(
              (result) => {
                setIsLoaded(true);
                
                const toAssign = {};
                toAssign[symbol] = result;
                setItems(Object.assign(items, toAssign));
                
                // setPriceColumn(i, 10, items[symbol]);
                // setTimestampColumn(0, 10, items[symbol]);

                console.log(items);
              },
              // Note: it's important to handle errors here
              // instead of a catch() block so that we don't swallow
              // exceptions from actual bugs in components.
              (error) => {
                setIsLoaded(true);
                setError(error);
              })
        }
        }
      }
      autoFocus
    />
  );

  data[0][0] = { value: 50, DataViewer: refreshButton, DataEditor: refreshButtonEditor };

  useEffect(() => {
    for (let i = 1; i < data[0].length; i++) {
      const symbol = data[0][i]["value"];
      fetchSymbol(symbol)
        .then(
          (result) => {
            setIsLoaded(true);
            
            const toAssign = {};
            toAssign[symbol] = result;
            setItems(Object.assign(items, toAssign));
            
            setPriceColumn(i, 10, items[symbol]);
            setTimestampColumn(0, 10, items[symbol]);

            console.log(items);
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            setIsLoaded(true);
            setError(error);
          })
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      for (let i = 1; i < data[0].length; i++) {
        const symbol = data[0][i];
        //setPriceColumn(i, 10, items[symbol] || arrPad({"close": 0}, 10, []));
        setPriceColumn(i, 10, items[symbol]);
        //setTimestampColumn(0, 10, items[symbol] || arrPad({"timestamp": Date.UTC(2020, 11, 20, 3, 23, 16, 738)}, 10, []));
        setTimestampColumn(0, 10, items[symbol]);
      }
    }, 5000);
    
  }, [items]);


  // setTimeout(() => {
  //   console.log(data[1][1]);
  //   setCount(count + 1);
  // }, 1000);

  const DynamicTable = dynamic(
    () => import("react-spreadsheet"),
    { ssr: false });

  function arrPad(val, totalSize, arr) {
    if (totalSize < arr.length) {
      throw new Error("Cannot pad to less than array length");
    }
    const copy = arr.slice(0, arr.length - 1);
    for (let i = 0; i < totalSize - arr.length; i++) {
      copy.push(val);
    }
    return copy;
  }

  function fetchSymbol(symbol) {
    return fetch(`/api/trades?symbol=${symbol}`)
      .then(res => res.json());
  }

  function setPriceColumn(colIndex, depth, prices) {
    if (!prices) {
      return;
    }
    const copy = data.slice(0, data.length);
    for (let i = 0; i < depth; i++) {
      copy[i + 1][colIndex] = { value: prices[i]["close"] };
    }
    setData(copy);
  }

  function setTimestampColumn(colIndex, depth, prices) {
    if (!prices) {
      return;
    }
    const copy = data.slice(0, data.length);
    for (let i = 0; i < depth; i++) {
      const date = new Date(prices[i]["timestamp"]);
      const readable = new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'medium' }).format(date);
      copy[i + 1][colIndex] = { value: readable };
    }
    setData(copy);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1> */}

        {(typeof window !== "undefined") ?
          <DynamicTable data={data} className="spread" />
          : <p></p>
        }

        {/* <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div> */}
      </main>

      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer> */}
    </div>
  )
}
