# CoinCompare

Website that uses public API of cryptocurrency exchanges to find lowest buying price and arbitrage opportunities

For more details regarding arbitrage and how our website works, visit [this article](https://medium.com/@namrapatel26/arbitrage-in-cryptocurrency-trading-fe5e177c46d2)

Link to website hosted on Heroku [https://coin-compare-17.herokuapp.com/](https://coin-compare-17.herokuapp.com/)

Demo of the website is available [here](https://youtu.be/Kjy9D0oRiWg)

Postman Collection for our API requests is [here](https://www.postman.com/vmnbits/workspace/team-workspace/request/19265479-1f065160-ba8d-4e0a-be44-f246e0de0711)

[Here](https://drive.google.com/file/d/1BXxaAbc_iogCYM59OSezcBrqz0vbK-12/view) is the use case of postman in development process 

## Further ahead

- We only included 5 coins and 4 exchanges due to time constraints, but this could be expanded to include all coins and exchanges. We'd need to create a parser for API calls for the corresponding coins and exchanges, as well as verify each exchange's cost structure.
- Next, we'll build a batch application with a tracker that will notify users via email or text message about any arbitrage opportunities.
- Furthermore, all of this could be automated, with users buying from one exchange and selling from another, but all of this would require authentications from all different exchanges and bank accounts in order to transfer funds and assets.

## To run the website

Use these commands to run the website. It will be available at [http://localhost:3000/](http://localhost:3000/)

```bash
npm install
npm start
```

## Meet the team

- [Vidit Patel](https://www.linkedin.com/in/vidit-patel-216ba8192/)
- [Namra Patel](https://www.linkedin.com/in/namrapatel26/)
- [Megh Patel](https://www.linkedin.com/in/megh-patel-1504/)
