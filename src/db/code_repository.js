class CodeRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tags TEXT,
      content TEXT,
      timestamp TEXT,
      createDate TEXT,
      createTime TEXT)`;
    return this.dao.run(sql);
  }

  create(note) {
    return this.dao.run(
      'INSERT INTO codes (content,tags, timestamp, createDate,createTime) VALUES (?,?,?,?,?)',
      [note.content, note.tags, note.timestamp, note.createDate, note.createTime]
    );
  }

  update(note) {
    const { id, content, tags } = note;
    return this.dao.run(`UPDATE codes SET content = ?, tags = ? WHERE id = ?`, [
      content,
      tags,
      id
    ]);
  }

  delete(id) {
    return this.dao.run(`DELETE FROM codes WHERE id = ?`, [id]);
  }

  getById(id) {
    return this.dao.get(`SELECT * FROM codes WHERE id = ?`, [id]);
  }

  getAll() {
    return this.dao.all(`SELECT * FROM codes`);
  }

  getByPage(page, size = 10) {
    const offset = (page - 1) * size;
    return this.dao.all(
      `SELECT * FROM codes order by id desc limit ${size} offset ${offset};`
    );
  }

  getTotal() {
    return this.dao.all(`SELECT count(*) num FROM codes`);
  }

  getByDate(date) {
    return this.dao.all(
      `SELECT * FROM codes WHERE createDate = ? order by id desc`,
      [date]
    );
  }

  search(keyword, date) {
    let sql = `SELECT * FROM codes`;

    if(keyword){
      sql += ` WHERE content like '%${keyword}%'`
    }
    if(date){
      if(sql.indexOf('WHERE') >= 0){
        sql += ` AND createDate = '${date}'`
      } else {
        sql += ` WHERE createDate = '${date}'`
      }
    }
    console.log(sql);

    return this.dao.all(sql);
  }

  reset() {
    const sql = `
      delete from codes;
      update sqlite_sequence SET seq = 0 where name ='codes';
    `;
    return this.dao.run(sql);
  }
}

module.exports = CodeRepository;
