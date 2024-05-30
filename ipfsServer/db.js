import sql2 from 'mysql2'

var con = sql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Fl6004c@suqeele",
  database: "panDB"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE kyc (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255), panNo VARCHAR(10), pahHash VARCHAR(90))";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });
  });