"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addcategoria, getcategoria, deletecategoria, updatecategoria } from "@/api/categoria";
import { getmateria } from "@/api/materia"; 
import Link from "next/link"; 
import { useUserStorage } from "@/zustand"; 


export default function CategoriasPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeCategoria, setNomeCategoria] = useState("");
  const [corCategoria, setCorCategoria] = useState("bg-purple-500");
  const [materiaId, setMateriaId] = useState(""); 
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  
  const usuarioLogado = useUserStorage((state) => state.loggedUser?.username || "Usuário");

  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading: carregandoCategorias } = useQuery({
    queryKey: ["categoria"],
    queryFn: getcategoria,
  });

  const { data: materias = [], isLoading: carregandoMaterias } = useQuery({
    queryKey: ["materia"],
    queryFn: getmateria,
  });

  const addMutation = useMutation({
    mutationFn: addcategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoria"] });
      fecharModal();
    },
    onError: (error) => {
      console.error(error);
      alert("Erro ao adicionar: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletecategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoria"] });
    },
  });

  const editMutation = useMutation({
    mutationFn: updatecategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoria"] });
      fecharModal();
    },
    onError: (error) => {
      console.error(error);
      alert("Erro ao editar: " + error.message);
    },
  });

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setNomeCategoria("");
    setCorCategoria("bg-purple-500");
    setMateriaId("");
  };

  const handleSalvar = () => {
    if (nomeCategoria.trim() === "") {
      alert("Digite um nome para a categoria.");
      return;
    }
    if (!materiaId) {
      alert("Selecione uma matéria à qual esta categoria pertence.");
      return;
    }

    const payload = {
      nome: nomeCategoria,
      cor: corCategoria,
      materiaId: materiaId, 
    };

    if (categoriaEditando) {
      editMutation.mutate({ objectId: categoriaEditando.objectId, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white border-r p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">StudyFlow</h1>
        <p className="text-sm text-gray-500 mb-8 pb-4 border-b">
          Olá, {usuarioLogado}!
        </p>
        <nav className="flex flex-col gap-4 text-black">
          <Link href="/dashboard" className="text-left hover:text-purple-700 transition-colors">
            Dashboard
          </Link>
          <Link href="/materia" className="text-left hover:text-purple-700 transition-colors">
            Matérias
          </Link>
          <Link href="/tarefa" className="text-left hover:text-purple-700 transition-colors">
            Tarefas
          </Link>
          <Link href="/categoria" className="text-left font-semibold text-purple-700">
            Categorias
          </Link>
          <Link href="/userDetails" className="text-left hover:text-purple-700 transition-colors">Perfil</Link>
          <Link href="/logout" className="text-red-500 mt-auto pt-4 border-t">Sair</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-700">Categorias</h1>
          <button
            onClick={fecharModal}
            onMouseDown={() => setModalAberto(true)} 
            className="bg-purple-700 hover:bg-purple-800 transition-colors text-white px-4 py-2 rounded-lg"
          >
            + Nova Categoria
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {carregandoCategorias ? (
            <p className="text-gray-500">Carregando categorias...</p>
          ) : categorias.length === 0 ? (
            <p className="text-gray-500">Nenhuma categoria cadastrada ainda.</p>
          ) : (
            categorias.map((categoria) => {
              const materiaVinculada = materias.find(m => m.objectId === categoria.materiaId);

              return (
                <div
                  key={categoria.objectId}
                  className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${categoria.cor || 'bg-gray-400'}`} />
                    <div className="flex flex-col">
                      <span className="text-black font-medium">{categoria.nome}</span>
                      <span className="text-sm text-gray-500">
                        Matéria: {materiaVinculada ? materiaVinculada.nome : "Não vinculada"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCategoriaEditando(categoria);
                        setNomeCategoria(categoria.nome);
                        setCorCategoria(categoria.cor || "bg-purple-500");
                        setMateriaId(categoria.materiaId || "");
                        setModalAberto(true);
                      }}
                      className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 transition-colors text-black rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Tem certeza que deseja excluir?")) {
                          deleteMutation.mutate(categoria);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 transition-colors text-white rounded disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {modalAberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold text-black mb-4">
                {categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
              </h2>

              <input
                type="text"
                placeholder="Nome da categoria"
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                className="w-full border p-2 rounded mb-4 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                className="w-full border p-2 rounded mb-4 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={carregandoMaterias}
              >
                <option value="">
                  {carregandoMaterias ? "Carregando matérias..." : "-- Selecione a Matéria --"}
                </option>
                {materias.map((materia) => (
                  <option key={materia.objectId} value={materia.objectId}>
                    {materia.nome}
                  </option>
                ))}
              </select>

              <select
                value={corCategoria}
                onChange={(e) => setCorCategoria(e.target.value)}
                className="w-full border p-2 rounded mb-6 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="bg-red-500">Vermelho</option>
                <option value="bg-blue-500">Azul</option>
                <option value="bg-green-500">Verde</option>
                <option value="bg-yellow-500">Amarelo</option>
                <option value="bg-purple-500">Roxo</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={fecharModal}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={addMutation.isPending || editMutation.isPending}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                >
                  {(addMutation.isPending || editMutation.isPending) ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}