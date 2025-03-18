import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";
import moment from "moment-timezone";
import "../CSS/TradingViewChart.css";

const SolanaChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [priceData, setPriceData] = useState([]);
  const [latestPrice, setLatestPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [priceChangePercent, setPriceChangePercent] = useState(null);
  const [high24h, setHigh24h] = useState("Loading...");
  const [low24h, setLow24h] = useState("Loading...");
  const [activeTab, setActiveTab] = useState("chart"); // Track active tab
  const prevClosePrice = useRef(null);

  useEffect(() => {
    if (activeTab !== "chart" || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose(); // Destroy old instance before re-creating
    }

    chartInstance.current = echarts.init(chartRef.current, "dark");

    const fetchHistoricalData = async () => {
      let interval = "1m";
      let endTime = Date.now();
      let startTime = endTime - 60 * 60 * 1000; // Last 1 hour of data
      let limit = 60;

      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=SOLUSDT&interval=${interval}&limit=${limit}&startTime=${startTime}&endTime=${endTime}`
        );

        const formattedData = response.data.map((candle) => ({
          time: moment(candle[0]).tz("Asia/Kolkata").format("HH:mm"),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
        }));

        setPriceData(formattedData);
        setLatestPrice(formattedData[formattedData.length - 1].close);
        updateChart(formattedData);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    const fetch24hStats = async () => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT`
        );

        const prevClose = parseFloat(response.data.prevClosePrice);
        prevClosePrice.current = prevClose;

        setHigh24h(parseFloat(response.data.highPrice).toFixed(2));
        setLow24h(parseFloat(response.data.lowPrice).toFixed(2));

        // Ensure price change updates correctly
        if (latestPrice) {
          const change = (latestPrice - prevClose).toFixed(2);
          const changePercent = ((change / prevClose) * 100).toFixed(2);
          setPriceChange(change);
          setPriceChangePercent(changePercent);
        }
      } catch (error) {
        console.error("Error fetching 24H stats:", error);
      }
    };

    const updateChart = (data) => {
      if (!chartInstance.current) return;

      const minPrice = Math.min(...data.map((d) => d.low)) * 0.995;
      const maxPrice = Math.max(...data.map((d) => d.high)) * 1.005;

      const option = {
        backgroundColor: "#0d0d0d",
        grid: { left: "5%", right: "5%", top: "10%", bottom: "10%" },
        tooltip: {
          trigger: "axis",
          backgroundColor: "#222",
          borderColor: "#FFD700",
          borderWidth: 1,
          textStyle: { color: "#FFD700", fontSize: 14 },
        },
        xAxis: {
          type: "category",
          data: data.map((d) => d.time),
          axisLabel: {
            color: "#FFD700",
            fontWeight: "bold",
            fontSize: 12,
            interval: function (index, value) {
              return moment(value, "HH:mm").minute() % 5 === 0 ? true : false;
            },
          },
          axisLine: { lineStyle: { color: "#FFD700" } },
          boundaryGap: false,
        },

        yAxis: {
          type: "value",
          min: minPrice,
          max: maxPrice,
          axisLabel: { color: "#AAA" },
          splitLine: { lineStyle: { color: "#333" } },
        },
        series: [
          {
            name: "Candlestick",
            type: "candlestick",
            data: data.map((d) => [d.open, d.close, d.low, d.high]),
            itemStyle: {
              color: "#00C805",
              color0: "#FF4C4C",
              borderColor: "#00C805",
              borderColor0: "#FF4C4C",
            },
          },
        ],
      };

      chartInstance.current.setOption(option);
    };

    fetchHistoricalData();
    fetch24hStats();

    // WebSocket for real-time price updates
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/solusdt@trade`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const newPrice = parseFloat(message.p);

      setLatestPrice(newPrice);

      if (prevClosePrice.current) {
        const change = (newPrice - prevClosePrice.current).toFixed(2);
        const changePercent = ((change / prevClosePrice.current) * 100).toFixed(
          2
        );
        setPriceChange(change);
        setPriceChangePercent(changePercent);
      }
    };

    return () => {
      ws.close();
      chartInstance.current.dispose();
    };
  }, [activeTab]);

  return (
    <div className="chart-container">
      <div className="tab-buttons">
        <button
          className={`tab ${activeTab === "chart" ? "active" : ""}`}
          onClick={() => setActiveTab("chart")}
        >
          Chart
        </button>
        <button
          className={`tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          INFO
        </button>
      </div>

      {activeTab === "chart" ? (
        <>
          <h2 className="price-text">
            SOL/USD{" "}
            <span
              style={{ color: "#00FF00", fontSize: "24px", fontWeight: "bold" }}
            >
              ${latestPrice ? latestPrice.toFixed(2) : "Loading..."}
            </span>
            <span
              style={{
                color: priceChange >= 0 ? "#00FF00" : "#FF4C4C",
                fontSize: "18px",
                marginLeft: "10px",
              }}
            >
              ({priceChange >= 0 ? "+" : ""}
              {priceChange} USD, {priceChangePercent}%)
            </span>
            <span style={{ margin: "0 15px", color: "#AAA" }}>|</span>
            24H High: <span style={{ color: "#00FF00" }}>${high24h}</span>
            <span style={{ margin: "0 15px", color: "#AAA" }}>|</span>
            24H Low: <span style={{ color: "#FF4C4C" }}>${low24h}</span>
          </h2>
          <div ref={chartRef} className="chart-wrapper" />
        </>
      ) : (
        <div className="info-container">
          <h2 className="info-title">Solana (SOL)</h2>
          <p>Market Cap: $100.45B | Rank: #6 | Volume: $5.46B</p>
          <p>
            Solana is a high-speed blockchain supporting 65k transactions/sec
            with Proof-of-History.
          </p>
        </div>
      )}
    </div>
  );
};

export default SolanaChart;
