// Preserve the existing D1 interface and atomic batches on a libSQL database.
function plain(value){
 if(typeof value==='bigint')return Number(value);
 if(value instanceof ArrayBuffer)return Array.from(new Uint8Array(value));
 return value;
}
function result(set){return {success:true,results:set.rows.map(row=>Object.fromEntries(set.columns.map(key=>[key,plain(row[key])]))),meta:{changes:set.rowsAffected,last_row_id:plain(set.lastInsertRowid)||0}};}
export function d1Adapter(client){
 class Statement{
  constructor(sql,args=[]){this.sql=sql;this.args=args;}
  bind(...args){return new Statement(this.sql,args.map(x=>x===undefined?null:x));}
  async all(){return result(await client.execute({sql:this.sql,args:this.args}));}
  async first(column){const row=(await this.all()).results[0];return row?(column===undefined?row:row[column]):null;}
  async run(){return this.all();}
 }
 return {prepare:sql=>new Statement(sql),batch:async statements=>(await client.batch(statements.map(s=>({sql:s.sql,args:s.args})),'write')).map(result)};
}
