"use client";

import { useState } from "react";
import { Plus, X, Tag, ChevronDown, ChevronUp } from "lucide-react";

type LocalValue = { localId: string; value: string };
type LocalAttribute = { localId: string; name: string; values: LocalValue[] };

type InitialAttribute = {
  id?: string;
  name: string;
  values: { id?: string; value: string }[];
};

interface Props {
  initialAttributes?: InitialAttribute[];
  disabled?: boolean;
}

let _nextId = 0;
const uid = () => `local-${_nextId++}`;

function makeAttr(name = "", values: string[] = []): LocalAttribute {
  return {
    localId: uid(),
    name,
    values: values.map((v) => ({ localId: uid(), value: v })),
  };
}

export function AttributeSelector({ initialAttributes = [], disabled }: Props) {
  const [enabled, setEnabled] = useState(initialAttributes.length > 0);
  const [attrs, setAttrs] = useState<LocalAttribute[]>(() =>
    initialAttributes.map((a) => ({
      localId: uid(),
      name: a.name,
      values: a.values.map((v) => ({ localId: uid(), value: v.value })),
    }))
  );

  // Índice del atributo expandido para agregar valor
  const [expandedAttr, setExpandedAttr] = useState<string | null>(null);
  const [newValueInput, setNewValueInput] = useState("");

  // Form de nuevo atributo
  const [showNewAttrForm, setShowNewAttrForm] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");

  const serialized = JSON.stringify(
    attrs.map((a) => ({ name: a.name, values: a.values.map((v) => ({ value: v.value })) }))
  );

  const addAttr = () => {
    const name = newAttrName.trim();
    if (!name) return;
    const values = newAttrValues.split(",").map((v) => v.trim()).filter(Boolean);
    setAttrs((prev) => [...prev, makeAttr(name, values)]);
    setNewAttrName("");
    setNewAttrValues("");
    setShowNewAttrForm(false);
  };

  const removeAttr = (localId: string) => {
    setAttrs((prev) => prev.filter((a) => a.localId !== localId));
    if (expandedAttr === localId) setExpandedAttr(null);
  };

  const updateAttrName = (localId: string, name: string) => {
    setAttrs((prev) => prev.map((a) => (a.localId === localId ? { ...a, name } : a)));
  };

  const addValue = (attrLocalId: string) => {
    const val = newValueInput.trim();
    if (!val) return;
    setAttrs((prev) =>
      prev.map((a) =>
        a.localId === attrLocalId
          ? { ...a, values: [...a.values, { localId: uid(), value: val }] }
          : a
      )
    );
    setNewValueInput("");
  };

  const removeValue = (attrLocalId: string, valueLocalId: string) => {
    setAttrs((prev) =>
      prev.map((a) =>
        a.localId === attrLocalId
          ? { ...a, values: a.values.filter((v) => v.localId !== valueLocalId) }
          : a
      )
    );
  };

  const handleToggle = (on: boolean) => {
    if (!on && attrs.length > 0) {
      if (!confirm("¿Querés quitar todos los atributos de este producto?")) return;
      setAttrs([]);
      setShowNewAttrForm(false);
    }
    setEnabled(on);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="attributes_json" value={enabled ? serialized : "[]"} />

      {!enabled ? (
        <button
          type="button"
          onClick={() => setEnabled(true)}
          disabled={disabled}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed border-white/[0.1] hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] text-left transition-all duration-300 group"
        >
          <div className="h-10 w-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.08] transition-colors">
            <Tag className="h-5 w-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-300 group-hover:text-foreground transition-colors">
              Agregar atributos al producto
            </p>
            <p className="text-xs text-slate-600 mt-0.5">Color, Material, Talle, Marca...</p>
          </div>
          <Plus className="h-4 w-4 text-slate-600 group-hover:text-slate-400 ml-auto flex-shrink-0 transition-colors" />
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-foreground">Atributos</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(false)}
              disabled={disabled}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
            >
              Quitar sección
            </button>
          </div>

          {/* Lista de atributos */}
          {attrs.map((attr) => {
            const isExpanded = expandedAttr === attr.localId;
            return (
              <div key={attr.localId} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                {/* Header del atributo */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => updateAttrName(attr.localId, e.target.value)}
                    placeholder="Nombre del atributo"
                    className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-slate-600 outline-none"
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedAttr(null);
                        setNewValueInput("");
                      } else {
                        setExpandedAttr(attr.localId);
                      }
                    }}
                    disabled={disabled}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4" />
                      : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAttr(attr.localId)}
                    disabled={disabled}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Chips de valores */}
                {attr.values.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-4 pb-3">
                    {attr.values.map((v) => (
                      <span
                        key={v.localId}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/[0.06] text-slate-300 border border-white/[0.08]"
                      >
                        {v.value}
                        <button
                          type="button"
                          onClick={() => removeValue(attr.localId, v.localId)}
                          disabled={disabled}
                          className="text-slate-500 hover:text-red-400 transition-colors ml-0.5"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input para agregar valor */}
                {isExpanded && (
                  <div className="border-t border-white/[0.05] px-4 py-3 flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newValueInput}
                      onChange={(e) => setNewValueInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addValue(attr.localId); }
                        if (e.key === "Escape") { setExpandedAttr(null); setNewValueInput(""); }
                      }}
                      placeholder="Agregar valor y presionar Enter..."
                      className="flex-1 glass-input px-3 py-1.5 text-xs"
                      disabled={disabled}
                    />
                    <button
                      type="button"
                      onClick={() => addValue(attr.localId)}
                      disabled={disabled || !newValueInput.trim()}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-xs text-slate-300 transition-colors disabled:opacity-40"
                    >
                      Agregar
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Form nuevo atributo */}
          {showNewAttrForm ? (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Nuevo atributo</p>
              <input
                type="text"
                autoFocus
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAttr(); } }}
                placeholder="Nombre (ej: Color)"
                className="glass-input px-3 py-2 text-sm"
                disabled={disabled}
              />
              <input
                type="text"
                value={newAttrValues}
                onChange={(e) => setNewAttrValues(e.target.value)}
                placeholder="Valores separados por coma (ej: Rojo, Azul, Negro)"
                className="glass-input px-3 py-2 text-sm"
                disabled={disabled}
              />
              <p className="text-xs text-slate-600">Podés agregar o editar valores después.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addAttr}
                  disabled={disabled || !newAttrName.trim()}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewAttrForm(false); setNewAttrName(""); setNewAttrValues(""); }}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewAttrForm(true)}
              disabled={disabled}
              className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 border border-dashed border-white/[0.08] hover:border-white/[0.15] rounded-xl px-4 py-2.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              Agregar atributo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
