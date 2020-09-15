class UrlRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link TEXT,
      title TEXT,
      createDate TEXT,
      timestamp TEXT)`;
    return this.dao.run(sql);
  }

  create(url) {
    return this.dao.run(
      "INSERT INTO urls (link, title, createDate, timestamp) VALUES (?,?,?,?)",
      [url.link, url.title, url.createDate, url.timestamp]
    );
  }

  update(url) {
    const { id, title } = url;
    return this.dao.run(`UPDATE urls SET title = ? WHERE id = ?`, [title, id]);
  }

  delete(id) {
    return this.dao.run(`DELETE FROM urls WHERE id = ?`, [id]);
  }

  getById(id) {
    return this.dao.get(`SELECT * FROM urls WHERE id = ?`, [id]);
  }

  getAll() {
    return this.dao.all(`SELECT * FROM urls`);
  }

  getByPage(page, size = 10) {
    const offset = (page - 1) * size;
    return this.dao.all(
      `SELECT * FROM urls order by id desc limit ${size} offset ${offset};`
    );
  }

  getTotal() {
    return this.dao.all(`SELECT count(*) num FROM urls`);
  }

  getByDate(date) {
    return this.dao.all(
      `SELECT * FROM urls WHERE createDate = ? order by id desc`,
      [date]
    );
  }

  search(keyword, date) {
    let sql = `SELECT * FROM urls`;

    if (keyword) {
      sql += ` WHERE title like '%${keyword}%'`;
    }
    if (date) {
      if (sql.indexOf("WHERE") >= 0) {
        sql += ` AND createDate = '${date}'`;
      } else {
        sql += ` WHERE createDate = '${date}'`;
      }
    }
    console.log(sql);

    return this.dao.all(sql);
  }

  reset() {
    const sql = `
      delete from urls;
      update sqlite_sequence SET seq = 0 where name ='urls';
    `;
    return this.dao.run(sql);
  }
}

module.exports = UrlRepository;
