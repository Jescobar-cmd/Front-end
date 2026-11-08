/**
 * API de First Gig (frontend) — mapeo 1:1 con los endpoints del backend.
 *
 * Autenticación — /api/auth
 *   POST   /auth/register                register
 *   POST   /auth/verify-code             verifyCode
 *   POST   /auth/resend-code             resendCode
 *   POST   /auth/login                   login
 *   POST   /auth/google                  loginGoogle
 *   POST   /auth/google/complete-profile completeGoogleProfile
 *   POST   /auth/me/seleccionar-rol      selectRole
 *   POST   /auth/forgot-password         forgotPassword
 *   POST   /auth/reset-password          resetPassword
 *   GET    /auth/me                      getMe
 *   PATCH  /auth/me/password             changePassword
 *
 * Cliente — /api/cliente
 *   GET    /cliente/perfil                                        getClientProfile
 *   PATCH  /cliente/perfil                                        updateClientProfile
 *   POST   /cliente/ofertas                                       createOffer
 *   GET    /cliente/ofertas                                       getMyOffers
 *   GET    /cliente/ofertas/:id                                   getMyOffer
 *   PATCH  /cliente/ofertas/:id                                   updateOffer
 *   PATCH  /cliente/ofertas/:id/estado                            changeOfferStatus
 *   GET    /cliente/ofertas/:id/propuestas                        getOfferProposals
 *   POST   /cliente/ofertas/:id/propuestas/:propuestaId/aceptar  acceptProposal
 *   POST   /cliente/ofertas/:id/propuestas/:propuestaId/rechazar  rejectProposal
 *
 * Freelancer — /api/freelancer
 *   GET    /freelancer/perfil      getFreelancerProfile
 *   PATCH  /freelancer/perfil      updateFreelancerProfile
 *   GET    /freelancer/servicios   getMyServices
 *   GET    /freelancer/propuestas  getMyProposals
 *
 * Servicios — /api/servicios
 *   GET    /servicios              listServices
 *   GET    /servicios/:id          getService
 *   POST   /servicios              createService
 *   PATCH  /servicios/:id          updateService
 *   PATCH  /servicios/:id/estado   changeServiceStatus
 *
 * Marketplace de ofertas — /api/ofertas
 *   GET    /ofertas                getMarketOffers
 *   GET    /ofertas/:id            getMarketOffer
 *   POST   /ofertas/:id/propuestas sendProposal
 *
 * Publicaciones / Blog — /api/publicaciones
 *   POST   /publicaciones          createPost
 *   GET    /publicaciones          getPosts
 *   GET    /publicaciones/:id      getPost
 *   DELETE /publicaciones/:id      deletePost
 *   POST   /publicaciones/:id/like toggleLike
 *   GET    /feed                   getFeed
 *
 * Conversaciones / Chat — /api/conversaciones
 *   POST   /conversaciones              createConversation
 *   GET    /conversaciones              getConversations
 *   GET    /conversaciones/:id          getConversation
 *   GET    /conversaciones/:id/mensajes getMessages
 *   POST   /conversaciones/:id/mensajes sendMessage
 *   POST   /conversaciones/:id/ofertas  sendChatOffer
 *   PATCH  /conversaciones/:id/leido    markRead
 *
 * Ofertas dentro del chat — /api/ofertas-chat
 *   POST   /ofertas-chat/:id/aceptar     acceptChatOffer
 *   POST   /ofertas-chat/:id/rechazar    rejectChatOffer
 *   POST   /ofertas-chat/:id/contraoferta counterChatOffer
 *
 * Contratos — /api/contratos
 *   GET    /contratos                        getContracts
 *   GET    /contratos/:id                    getContract
 *   PATCH  /contratos/:id/estado             updateContractStatus / completeContract / cancelContract
 *   GET    /contratos/:id/calificaciones     getContractRatings
 *   POST   /contratos/:id/calificaciones     rateContract
 *
 * Catálogos y usuarios
 *   GET    /categorias      getCategories
 *   GET    /habilidades     getSkills
 *   GET    /usuarios/:id    getPublicProfile
 *
 * Nota: /health, /api-docs y /api-docs.json son endpoints de infraestructura/documentación (no cliente API).
 */

export { apiFetch } from "./client";
export type { ApiError, RespuestaApi } from "./client";
export { httpClient } from "./httpClient";
export type { ResultadoApi } from "./httpClient";

export {
  register,
  verifyCode,
  resendCode,
  login,
  loginGoogle,
  completeGoogleProfile,
  selectRole,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
} from "./apiAuth";

export {
  getClientProfile,
  updateClientProfile,
  getFreelancerProfile,
  updateFreelancerProfile,
  getPublicProfile,
} from "./apiPerfiles";
export type {
  ClientePerfil,
  DatosPerfilCliente,
  DatosPerfilFreelancer,
  FreelancerPerfil,
  HabilidadAsignada,
  PerfilCliente,
  PerfilFreelancer,
  PerfilPublico,
  RespuestaPerfilCliente,
  RespuestaPerfilFreelancer,
} from "./apiPerfiles";

export {
  createOffer,
  getMyOffers,
  getMyOffer,
  updateOffer,
  changeOfferStatus,
  getOfferProposals,
  acceptProposal,
  rejectProposal,
  getMyProposals,
  getMarketOffers,
  getMarketOffer,
  sendProposal,
} from "./apiOfertas";
export type {
  ClienteOferta,
  DatosPropuesta,
  OfertaMarketplace,
  OfertaMarketplacePaginada,
  Propuesta,
  RespuestaAccionPropuesta,
} from "./apiOfertas";

export {
  listServices,
  getService,
  createService,
  updateService,
  changeServiceStatus,
  getMyServices,
} from "./apiServicios";
export type {
  DatosActualizacionServicio,
  DatosServicio,
  EstadoServicio,
  RespuestaServicio,
  Servicio,
} from "./apiServicios";

export {
  createPost,
  getPosts,
  getPost,
  deletePost,
  toggleLike,
  getFeed,
} from "./apiPublicaciones";
export type {
  AutorPublicacion,
  DatosPublicacion,
  Feed,
  Publicacion,
} from "./apiPublicaciones";

export {
  createConversation,
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  sendChatOffer,
  markRead,
  acceptChatOffer,
  rejectChatOffer,
  counterChatOffer,
} from "./apiChat";
export type {
  ContextoConversacion,
  Contraparte,
  Conversacion,
  ConversacionParticipante,
  DatosConversacion,
  DatosMensaje,
  DatosOfertaChat,
  Mensaje,
  OfertaChatResumen,
  RespuestaAccionChat,
  UltimoMensaje,
} from "./apiChat";

export {
  getContracts,
  getContract,
  updateContractStatus,
  completeContract,
  cancelContract,
  getContractRatings,
  rateContract,
} from "./apiContratos";
export type {
  Calificacion,
  ContextoContrato,
  Contrato,
  EstadoContratoFinal,
  ParticipanteContrato,
  RespuestaCalificacion,
  RespuestaContrato,
  RespuestaListadoCalificaciones,
} from "./apiContratos";

export { getCategories, getSkills } from "./apiCatalogos";
export type { Habilidad } from "./apiCatalogos";
