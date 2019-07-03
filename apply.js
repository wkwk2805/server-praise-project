const apply = {
  processContents: str => {
    if (!str) return;
    const strArr = str.split(/\n\n/);
    const arr = [];
    strArr.forEach((item, i) => {
      const obj = {};
      obj.c_id = i;
      obj.statement = item;
      arr.push(obj);
    });
    return arr;
  },
  processId: db => {
    let data = db
      .get("lyrics")
      .orderBy("l_id", "desc")
      .value()[0];
    let id = 0;
    data && (id = Object.assign(data.l_id, 0));
    return ++id;
  },
  processFile: file => {
    if (!file) return;
    return file.split(/\\/)[2];
  }
};

module.exports = apply;
