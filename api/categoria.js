import axios from "axios";

const instance = axios.create({
  baseURL: "https://parseapi.back4app.com",
  headers: {
    "X-Parse-Application-Id": "7DM3RcxZPnRauPJTaV9YDfW60zPjMql5jK9blfME",
    "X-Parse-REST-API-Key": "TZVHd0LZfGGwQ0zukS4yiM71yhE9A15wo5mZNHOB",
    "Content-Type": "application/json",
  },
});

const categoriaURL = "/classes/categoria";


export async function getcategoria() {
  const response = await instance.get(categoriaURL);
  return response.data.results;
}

export async function addcategoria(categoria) {
  const response = await instance.post(
    categoriaURL,
    {
      nome: categoria.nome,
      cor: categoria.cor,
      materiaId: categoria.materiaId
    }
  );
  
  return response.data;
}

export async function updatecategoria(categoria) {
  const response = await instance.put(`${categoriaURL}/${categoria.objectId}`, {
    nome: categoria.nome,
    cor: categoria.cor,
    materiaId: categoria.materiaId
  });
  
  return response.data;
}
export async function deletecategoria(categoria) {
  const response = await instance.delete(`${categoriaURL}/${categoria.objectId}`);
  return response.data;
}