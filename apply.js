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
  },
  processSearch: (db, info, _) => {
    let infos = info.split(" ");
    let resultArr = [];
    for (let item of infos) {
      let result = db
        .get("lyrics")
        .filter(lyrics => {
          let str =
            lyrics.contents.map(e => e.statement).join(" ") +
            lyrics.title +
            lyrics.code;
          return new RegExp(item, "gim").test(str.replace(" ", ""));
        })
        .take(9)
        .value();
      resultArr = resultArr.concat(result);
    }
    resultArr = _.groupBy(resultArr, function(obj) {
      return obj.l_id;
    });
    let setArr = [];
    let values = _.values(resultArr);
    for (let item of values) {
      const obj = { num: item.length, con: [...new Set(item)] };
      setArr.push(obj);
    }
    let sortData = _.sortBy(setArr, obj => obj.num).reverse();
    let resultData = sortData.map(e => e.con);
    let lastData = _.flatten(resultData);
    return lastData;
  }
};

module.exports = apply;
