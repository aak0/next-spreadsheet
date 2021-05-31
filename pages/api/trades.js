export default (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    res.json({ message: "Invalid symbol"});
  }
  console.log(req.query);

  fetch(`https://www.bitmex.com/api/v1/trade/bucketed?binSize=5m&symbol=${symbol}&reverse=true`)
      .then(result => result.json())
      .then(
        (result) => {
          res.json(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          res.json(error);
        });
}