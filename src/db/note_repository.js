class NoteRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      timestamp TEXT,
      createDate TEXT,
      createTime TEXT)`;
    return this.dao.run(sql);
  }

  create(note) {
    return this.dao.run(
      'INSERT INTO notes (content,timestamp,createDate,createTime) VALUES (?,?,?,?)',
      [note.content,note.timestamp, note.createDate, note.createTime]
    );
  }

  update(note) {
    const { id, content } = note;
    return this.dao.run(`UPDATE notes SET content = ? WHERE id = ?`, [
      content,
      id
    ]);
  }

  delete(id) {
    return this.dao.run(`DELETE FROM notes WHERE id = ?`, [id]);
  }

  getById(id) {
    return this.dao.get(`SELECT * FROM notes WHERE id = ?`, [id]);
  }

  getAll() {
    return this.dao.all(`SELECT * FROM notes`);
  }

  getByPage(page, size = 10) {
    const offset = (page - 1) * size;
    return this.dao.all(
      `SELECT * FROM notes order by id desc limit ${size} offset ${offset};`
    );
  }

  getTotal() {
    return this.dao.all(`SELECT count(*) num FROM notes`);
  }

  getByDate(date) {
    return this.dao.all(
      `SELECT * FROM notes WHERE createDate = ? order by id desc`,
      [date]
    );
  }

  searchTotal(params){
    const { keyword, date } = params;

    let sql = `SELECT count(*) num FROM notes`;

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

  search(params) {
    const page = params.page || 1;
    const size = params.size || 10;
    const keyword = params.keyword || '';
    const date = params.date || '';
    const offset = (page - 1) * size;
    let sql = `SELECT * FROM notes`;

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

    sql += ` order by id desc limit ${size} offset ${offset}`
    console.log(sql);

    return this.dao.all(sql);
  }

  reset() {
    const sql = `
      delete from notes;
      update sqlite_sequence SET seq = 0 where name ='notes';
    `;
    return this.dao.run(sql);
  }
}

module.exports = NoteRepository;
