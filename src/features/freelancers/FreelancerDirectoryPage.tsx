import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, buttonClassName } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import type { Categoria } from "../../core/domain/entities/categoria";
import { listFreelancers } from "../../infrastructure/api/apiFreelancers";
import type { FreelancerDirectorioItem } from "../../infrastructure/api/apiFreelancers";
import { getCategories, getSkills } from "../../infrastructure/api/apiCatalogos";
import type { Habilidad } from "../../infrastructure/api/apiCatalogos";
import { useInternalSearch } from "../layout/InternalSearchContext";
import { FreelancerCard } from "./FreelancerCard";
import "./freelancers.css";

const PAGE_SIZE = 12;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export function FreelancerDirectoryPage() {
  const { token } = useAuth();
  const { query: sharedQuery, setQuery } = useInternalSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = Number(searchParams.get("page"));
  const [query, setLocalQuery] = useState(() => searchParams.get("q") ?? "");

  const [items, setItems] = useState<FreelancerDirectorioItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number.isInteger(urlPage) && urlPage > 0 ? urlPage : 1);
  const [skillId, setSkillId] = useState(() => searchParams.get("habilidadId") ?? "");
  const [categoryId, setCategoryId] = useState(() => searchParams.get("categoriaId") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const previousSharedQuery = useRef(sharedQuery);
  const sharedQueryInitialized = useRef(false);

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [skills, setSkills] = useState<Habilidad[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [catalogsError, setCatalogsError] = useState("");
  const [catalogsReload, setCatalogsReload] = useState(0);

  const filtrosActivos = Boolean(query.trim() || skillId || categoryId);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (filtersInitialized) return;
    setQuery(query);
    setFiltersInitialized(true);
  }, [filtersInitialized, query, setQuery]);

  useEffect(() => {
    if (!filtersInitialized) return;

    if (!sharedQueryInitialized.current) {
      sharedQueryInitialized.current = true;
      previousSharedQuery.current = sharedQuery;
      if (sharedQuery !== query) setQuery(query);
      return;
    }

    if (sharedQuery !== previousSharedQuery.current) {
      previousSharedQuery.current = sharedQuery;
      if (sharedQuery !== query) {
        setLocalQuery(sharedQuery);
        setPage(1);
      }
    } else if (query !== sharedQuery) {
      previousSharedQuery.current = query;
      setQuery(query);
      setPage(1);
    }
  }, [filtersInitialized, query, setQuery, sharedQuery]);

  useEffect(() => {
    if (!filtersInitialized) return;

    const nextParams = new URLSearchParams(searchParams);
    const normalizedQuery = query.trim();
    if (normalizedQuery) nextParams.set("q", normalizedQuery);
    else nextParams.delete("q");
    if (skillId) nextParams.set("habilidadId", skillId);
    else nextParams.delete("habilidadId");
    if (categoryId) nextParams.set("categoriaId", categoryId);
    else nextParams.delete("categoriaId");
    if (page > 1) nextParams.set("page", String(page));
    else nextParams.delete("page");

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [categoryId, filtersInitialized, page, query, searchParams, setSearchParams, skillId]);

  useEffect(() => {
    if (!filtersInitialized) return;

    const nextQuery = searchParams.get("q") ?? "";
    const nextSkillId = searchParams.get("habilidadId") ?? "";
    const nextCategoryId = searchParams.get("categoriaId") ?? "";
    const nextPageValue = Number(searchParams.get("page"));
    const nextPage = Number.isInteger(nextPageValue) && nextPageValue > 0 ? nextPageValue : 1;

    if (nextQuery !== query) setLocalQuery(nextQuery);
    if (nextSkillId !== skillId) setSkillId(nextSkillId);
    if (nextCategoryId !== categoryId) setCategoryId(nextCategoryId);
    if (nextPage !== page) setPage(nextPage);
  }, [categoryId, filtersInitialized, page, query, searchParams, skillId]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setCatalogsLoading(true);
    setCatalogsError("");
    Promise.all([getCategories(token), getSkills(token)])
      .then(([nextCategories, nextSkills]) => {
        if (!active) return;
        setCategories(nextCategories);
        setSkills(nextSkills);
      })
      .catch((reason: unknown) => {
        if (active) setCatalogsError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setCatalogsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, catalogsReload]);

  useEffect(() => {
    if (loading || total === 0) return;
    const ultimaPagina = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > ultimaPagina) {
      setPage(ultimaPagina);
    }
  }, [loading, total, page]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setError("");
    listFreelancers(token, {
      page,
      limit: PAGE_SIZE,
      q: query.trim() || undefined,
      habilidadId: skillId ? Number(skillId) : undefined,
      categoriaId: categoryId ? Number(categoryId) : undefined,
    })
      .then((result) => {
        if (!active) return;
        setItems(result.items ?? []);
        setTotal(result.total);
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, page, query, skillId, categoryId, reload]);

  function limpiarFiltros() {
    setLocalQuery("");
    setQuery("");
    setSkillId("");
    setCategoryId("");
    setPage(1);
  }

  if (!token) return null;

  return (
    <div className="fl-page">
      <header className="fl-heading">
        <p className="fl-eyebrow">Directorio</p>
        <h1>Encuentra freelancers</h1>
        <p>
          Busca por nombre, especialidad o habilidad. Filtra por categoría y revisa el perfil y
          portafolio antes de contactar.
        </p>
        <div className="fl-heading__actions">
          <Link className={buttonClassName({ variant: "ghost", size: "sm" })} to="/servicios">
            Ver catálogo de servicios
          </Link>
        </div>
      </header>

      <form className="fl-filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="fl-filter fl-filter--search">
          <span>Buscar freelancer</span>
          <input
            type="search"
            value={query}
            placeholder="Nombre, especialidad o palabra clave"
            onChange={(event) => {
              setPage(1);
              setLocalQuery(event.target.value);
            }}
          />
        </label>

        <label className="fl-filter">
          <span>Categoría</span>
          <select
            value={categoryId}
            disabled={catalogsLoading || Boolean(catalogsError)}
            onChange={(event) => {
              setPage(1);
              setCategoryId(event.target.value);
            }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="fl-filter">
          <span>Habilidad</span>
          <select
            value={skillId}
            disabled={catalogsLoading || Boolean(catalogsError)}
            onChange={(event) => {
              setPage(1);
              setSkillId(event.target.value);
            }}
          >
            <option value="">Todas las habilidades</option>
            {skills.map((habilidad) => (
              <option key={habilidad.id} value={habilidad.id}>
                {habilidad.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="fl-filters__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={limpiarFiltros}
            disabled={!filtrosActivos}
          >
            Limpiar filtros
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReload((value) => value + 1)}
            disabled={loading}
          >
            Actualizar
          </Button>
        </div>
      </form>

      {catalogsError ? (
        <div className="fl-alert" role="alert">
          <span>No se pudieron cargar las categorías y habilidades: {catalogsError}</span>
          <Button variant="secondary" size="sm" onClick={() => setCatalogsReload((value) => value + 1)}>
            Reintentar
          </Button>
        </div>
      ) : null}

      <div className="fl-summary" aria-live="polite">
        <span>
          {loading
            ? "Buscando freelancers…"
            : `${total} ${total === 1 ? "freelancer" : "freelancers"}`}
        </span>
        {filtrosActivos ? <span className="fl-summary__filters">Filtros activos</span> : null}
      </div>

      {error ? (
        <div className="fl-alert" role="alert">
          <span>No se pudo cargar el directorio: {error}</span>
          <Button variant="secondary" size="sm" onClick={() => setReload((value) => value + 1)}>
            Reintentar
          </Button>
        </div>
      ) : loading ? (
        <div className="fl-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <article className="fl-card fl-card--skeleton" key={index}>
              <div className="fl-card__head">
                <span className="fl-skeleton fl-skeleton--avatar" />
                <div className="fl-card__identity">
                  <span className="fl-skeleton fl-skeleton--line fl-skeleton--short" />
                  <span className="fl-skeleton fl-skeleton--line" />
                  <span className="fl-skeleton fl-skeleton--line fl-skeleton--tiny" />
                </div>
              </div>
              <span className="fl-skeleton fl-skeleton--line" />
              <span className="fl-skeleton fl-skeleton--line fl-skeleton--wide" />
              <span className="fl-skeleton fl-skeleton--button" />
            </article>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={filtrosActivos ? "No encontramos freelancers para esos filtros" : "Aún no hay freelancers disponibles"}
          description={
            filtrosActivos
              ? "Prueba con otra búsqueda, habilidad o categoría."
              : "Vuelve pronto para descubrir nuevos perfiles."
          }
          actionLabel={filtrosActivos ? "Limpiar filtros" : "Actualizar"}
          onAction={filtrosActivos ? limpiarFiltros : () => setReload((value) => value + 1)}
        />
      ) : (
        <section className="fl-grid" aria-label="Freelancers disponibles">
          {items.map((freelancer) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} />
          ))}
        </section>
      )}

      {!loading && !error && items.length > 0 && totalPages > 1 ? (
        <nav className="fl-pager" aria-label="Paginación del directorio">
          <button
            className="fl-pager__button"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            className="fl-pager__button"
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </div>
  );
}