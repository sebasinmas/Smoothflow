Universidad de La Frontera
Facultad de Ingeniería y Ciencias — Ingeniería en Informática
Ingeniería de Requerimientos

ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE

Smooth Flow

Optimización de Agendamiento Clínico en Tiempo Real

Elaborado según el estándar IEEE Std 830-1998

Autores
Enrique Andrés Pincheira Rey
Sebastián Benjamín Bustos Beni
Cristopher Bastián Gallegos Jiménez

Versión 1.0 (Final)  |  03 de julio de 2026

Control de Versiones

Versión

Fecha

Autor(es)

Descripción del cambio

v0.1

24/04/2026

Pincheira, Bustos,
Gallegos

Creación inicial del documento SRS — Sección 1: Introducción
(formato, propósito, alcance, personal involucrado, referencias).

v0.1.1

07/06/2026

Pincheira, Bustos,
Gallegos

Ajustes de Sección 1: integración de citas normativas legales e
institucionales (REF-02, REF-03, REF-04, REF-07) en la
Introducción; control de versiones más específico.

v0.2

14/06/2026

Pincheira, Bustos,
Gallegos

v0.3

01/07/2026

Pincheira, Bustos,
Gallegos

v1.0 (Final)

03/07/2026

Pincheira, Bustos,
Gallegos

Creación de Sección 2: Descripción General — perspectiva del
producto, funcionalidad, características de usuarios, restricciones,
suposiciones y dependencias; definición de tecnologías y enfoque
de prototipo.

Revisión y cierre de Secciones 1 y 2; integración de comentarios
del ayudante/docente sobre redacción, trazabilidad de
referencias legales y formato de tablas.

Elaboración de Sección 3 — Requisitos Específicos (interfaces
externas, requisitos funcionales RF-01 a RF-18, requisitos de
rendimiento, restricciones de diseño, atributos del sistema y otros
requisitos). Elaboración de Anexos A–D: (A) Diagrama de Casos de
Uso y documentación por caso de uso; (B) indicadores de
cumplimiento de NFR según ISO/IEC 9126 y clasificación de
Sommerville; (C) diseño de interfaces gráficas; (D) diagrama
BPMN del proceso de agendamiento. Integración de comentarios
de revisión anteriores y consolidación de la versión final del
documento conforme a IEEE 830-1998.

Tabla de Contenidos

1.0  Introducción

       1.1 Propósito · 1.2 Alcance · 1.3 Personal Involucrado · 1.4 Definiciones, Acrónimos y Abreviaturas · 1.5 Referencias ·
1.6 Resumen

2.0  Descripción General

       2.1 Perspectiva del Producto · 2.2 Funcionalidad del Producto · 2.3 Características de los Usuarios · 2.4 Restricciones ·
2.5 Suposiciones y Dependencias · 2.6 Evolución Previsible del Sistema

3.0  Requisitos Específicos

       3.1 Requisitos de Interfaces Externas · 3.2 Requisitos Funcionales · 3.3 Requisitos de Rendimiento · 3.4 Restricciones de
Diseño · 3.5 Atributos del Sistema de Software · 3.6 Otros Requisitos

4.0  Anexos

       Anexo A: Diagrama y Documentación de Casos de Uso · Anexo B: Indicadores de Cumplimiento de NFR (ISO/IEC 9126 ·
Sommerville) · Anexo C: Diseño de Interfaces Gráficas · Anexo D: Diagrama BPMN del Proceso de Agendamiento

1.0  Introducción

Este  documento  describe  la  Especificación  de  Requisitos  de  Software  (SRS)  del  sistema  Smooth  Flow,
elaborada conforme al estándar IEEE 830-1998 [REF-01]. Su propósito es especificar los requisitos funcionales
y no funcionales que el sistema deberá satisfacer, de forma que sean verificables y sirvan de referencia para el
equipo de desarrollo y los interesados.

El sistema fue creado dentro de los márgenes legales en la temática de manejo de información en la salud en
mente. Es decir, en temas de privacidad, se mantienen las protecciones esperadas por la ley, como en la Ley
N.° 19.628 — Protección de la Vida Privada (Chile) [REF-02], que exige respetar en todo caso el pleno ejercicio
de los derechos fundamentales de los titulares de los datos y de las facultades que dicha ley les reconoce, y la
Ley N.° 20.584 sobre Derechos y Deberes de los Pacientes [REF-03]. A nivel operativo, se toman como base la
Ley N.° 21.541 de Salud Digital [REF-04] y el Manual de Agendamiento del MINSAL [REF-07]. Junto con esto,
se  contempla  mantener  el  software  compatible  con  sistemas  de  gobierno  y  software  externo  con  el  que
pueda interactuar, conforme a las Guías de Interoperabilidad HL7 FHIR Chile [REF-06] ("Health Level Seven",
"Fast Healthcare Interoperability Resources"), estándar internacional altamente utilizado.

El sistema Smooth Flow nace para mejorar la gestión de agendamiento en clínicas independientes que, pese a
contar  con  presencia  digital  básica,  dependen  mayoritariamente  del  trabajo  manual  de  personal
administrativo  para  mantener
la  sincronía  entre  reservas,  reagendamientos  y  cancelaciones.  Esta
dependencia genera errores de comunicación y sobrecarga en el personal administrativo.

1.1 Propósito

El  propósito  de  este  documento  es  describir  con  claridad  los  requisitos  del  sistema  Smooth  Flow  para los
siguientes destinatarios:

●  Equipo de desarrollo: como especificación técnica de base para el diseño, implementación y prueba

del software.

●  Patrocinadores y dueño de la clínica: como instrumento de validación del alcance funcional acordado.

●  Evaluadores académicos: como evidencia formal del proceso de Ingeniería de Requerimientos

aplicado.

El  documento  cubre  la  totalidad de los requisitos de la versión final del sistema, enfocada en el módulo de
gestión  de  agendamiento  y  notificaciones  en  tiempo  real  para  clínicas  independientes,  incluyendo  la
especificación de requisitos (Sección 3) y los anexos de diseño complementarios (Sección 4).

1.2 Alcance

El sistema a desarrollar se denomina Smooth Flow y consiste en una aplicación web para la gestión de citas
médicas en clínicas independientes. El sistema persigue los siguientes objetivos de negocio:

●  Automatizar la notificación de cambios en el estado de agendamientos (reservas, reagendamientos y
cancelaciones) hacia el personal administrativo y médico, mediante actualizaciones en tiempo real
basadas en el protocolo WebSocket (RFC 6455).

●  Reducir el volumen de errores administrativos asociados a la desincronización entre la agenda

gestionada por las secretarías y la agenda visible por los médicos de turno.

●  Proveer a los pacientes un canal de autogestión remota de sus citas, disponible las 24 horas del día.

El  sistema  no  incluye  en  su  alcance  inicial:  módulos  de facturación, gestión de fichas clínicas, teleconsulta,
prescripción  electrónica  ni  integración  directa  con  sistemas de salud pública. La integración con estándares
HL7 FHIR se considera como extensión futura (ver Sección 2.6).

1.3 Personal Involucrado

La tabla siguiente describe los stakeholders identificados en la etapa de levantamiento de requerimientos, su
rol respecto al sistema y su relevancia en el proceso de desarrollo.

Interesado

Rol

Relevancia en el sistema

MINSAL

Ente Regulador

Impone restricciones legales y normativas sobre privacidad de
datos y salud digital.

Dueño de la Clínica

Patrocinador / Médico de
turno

Principal tomador de decisiones; define prioridades funcionales y
es usuario directo del sistema.

Secretarías

Usuario Primario

Usuarias directas del panel de gestión; su eficiencia operativa es el
indicador central del sistema.

Médicos de Turno

Usuario Final

Pacientes

Beneficiario

Equipo de TI

Soporte Técnico

Receptores de las notificaciones de cambio de agenda; la
sincronización en tiempo real impacta directamente su práctica
clínica.

Beneficiarios indirectos; interactúan con el módulo de
agendamiento omnicanal para reservar, reagendar y cancelar citas.

Responsables de la infraestructura de red; garantizan la estabilidad
de las conexiones WebSocket persistentes.

1.4 Definiciones, Acrónimos y Abreviaturas

La  tabla  siguiente  reúne  los  términos  técnicos,  acrónimos  y  abreviaturas  utilizados  a  lo  largo  del presente
documento, con el fin de asegurar una interpretación unívoca por parte de todos los lectores.

Término / Acrónimo

Definición

SRS

WebSocket

WSS

Live Update

Agendamiento
Omnicanal

Software Requirements Specification. Documento formal que describe el comportamiento
esperado del sistema de software.

Protocolo de comunicación (RFC 6455) que establece un canal full-duplex persistente
sobre una única conexión TCP, iniciada mediante una solicitud HTTP con cabecera
Upgrade.

WebSocket Secure. Variante cifrada del protocolo WebSocket que opera sobre TLS/SSL en
el puerto 443.

Actualización en tiempo real del estado de la interfaz de usuario ante un evento del
sistema, sin necesidad de recargar la página.

Capacidad del sistema para recibir y gestionar solicitudes de citas a través de múltiples
canales (web, móvil) de forma unificada.

Término / Acrónimo

Definición

Contrapresión
(Backpressure)

Mecanismo de control de flujo que regula la velocidad de emisión de mensajes WebSocket
para evitar la saturación del cliente receptor.

HL7 FHIR

MINSAL

Stakeholder

Health Level 7 — Fast Healthcare Interoperability Resources. Estándar internacional para el
intercambio de información clínica entre sistemas de salud.

Ministerio de Salud de Chile. Organismo rector del sistema de salud nacional; su normativa
constituye la principal fuente de restricciones legales del proyecto.

Parte interesada. Individuo, grupo u organización que puede afectar o ser afectado por el
sistema de software.

Clínica Independiente

Establecimiento de salud privado de tamaño pequeño o mediano, no adscrito a una red
hospitalaria pública, con digitalización básica.

RF / RNF

BPMN

DCU

1.5 Referencias

Requisito Funcional / Requisito No Funcional, según la nomenclatura utilizada en la
Sección 3 de este documento.

Business Process Model and Notation. Notación gráfica estándar para el modelamiento de
procesos de negocio, utilizada en el Anexo D.

Diagrama de Casos de Uso. Representación UML de los actores y funcionalidades del
sistema, utilizada en el Anexo A.

Los  documentos  y  fuentes  indicados  en  la  tabla  siguiente  han  sido  consultados  durante  el  proceso  de
elicitación  y  análisis  de  requerimientos,  y  constituyen  las  restricciones  legales,  técnicas  y  operativas  que
condicionan el diseño del sistema.

ID

Título / Fuente

Descripción

Clasificación

[REF-01]

IEEE Std 830-1998 —
Recommended Practice for
Software Requirements
Specifications

Estándar base para la estructura y contenido del
presente documento SRS.

Estándar de
Ingeniería

[REF-02]

Ley N.° 19.628 — Protección
de la Vida Privada (Chile)

Define el tratamiento de datos sensibles; obliga al
sistema a implementar cifrado robusto para
proteger identidad y salud de los pacientes.

Restricción Legal

[REF-03]

Ley N.° 20.584 — Derechos y
Deberes de los Pacientes
(Chile)

Establece el derecho a información oportuna y el
resguardo de la ficha clínica; exige logs de acceso y
auditoría.

Restricción Legal

[REF-04]

Ley N.° 21.541 — Salud Digital
(Chile)

Autoriza prestaciones a distancia y equipara
registros digitales con presenciales; base legal del
agendamiento remoto.

Restricción Legal

[REF-05]

RFC 6455 — The WebSocket
Protocol

Protocolo técnico base para la comunicación
bidireccional full-duplex que sustenta las
actualizaciones en tiempo real.

Requisito Técnico

ID

Título / Fuente

Descripción

Clasificación

[REF-06]

Guías de Interoperabilidad HL7
FHIR Chile

[REF-07]

Manual de Agendamiento
CASR 2024 — MINSAL

[REF-08]

Inscripción de Proyecto —
Smooth Flow (UFRO, 2026)

Estándares para la comunicación con otras
plataformas de salud; condiciona el diseño del
modelo de datos.

Describe la gestión de sobrecupos, bloqueos de
agenda y confirmaciones; define la lógica de
negocio del sistema.

Documento de inscripción del proyecto que
establece la problemática, objetivo y descripción
inicial de stakeholders.

Requisito Técnico

Necesidad
Operativa

Documento
Interno

[REF-09]

ISO/IEC 9126-1:2001 —
Software Engineering, Product
Quality

Modelo de calidad utilizado para clasificar y definir
los indicadores de cumplimiento de requisitos no
funcionales (Anexo B).

Estándar de
Ingeniería

[REF-10]

Sommerville, I. — Software
Engineering (10.ª ed.)

Fuente de la categorización de requisitos no
funcionales (de producto, organizacionales y
externos) aplicada en el Anexo B.

Referencia
Académica

1.6 Resumen

El  documento  se  organiza  en  cuatro  secciones  y cuatro anexos. La Sección 1, correspondiente a este texto,
cubre la introducción del proyecto: propósito, alcance, stakeholders, terminología y referencias. La Sección 2
presenta  la  descripción  general  del  sistema: perspectiva y funcionalidad del producto, características de los
usuarios, restricciones, suposiciones y evolución previsible. La Sección 3 detalla los requisitos específicos del
sistema  —interfaces  externas,  requisitos  funcionales,  requisitos  de  rendimiento,  restricciones  de  diseño  y
atributos del sistema de software— siguiendo el estándar IEEE 830-1998.

La  Sección  4  reúne  los  anexos  que  complementan  la  especificación:  el  Diagrama  de  Casos  de  Uso  con  su
documentación asociada (Anexo A), los indicadores de cumplimiento de requisitos no funcionales clasificados
según  ISO/IEC  9126  y  Sommerville  (Anexo  B),  el  diseño  de  interfaces  gráficas  (Anexo  C)  y  el  diagrama  de
procesos de negocio en notación BPMN (Anexo D).

Se recomienda leer la Sección 1 antes que las siguientes, ya que define los términos y el contexto del proyecto
que se utilizan a lo largo de todo el documento.

— Fin de la Sección 1 —

2.0  Descripción General

Esta  sección  proporciona  una  visión  de  alto  nivel  del  sistema  Smooth  Flow,  describiendo  su  contexto
operativo, las funciones que debe realizar, las características de sus usuarios y las limitaciones bajo las cuales
debe operar. No constituye una declaración formal de requisitos; su propósito es enmarcar el sistema dentro
de  su  entorno  de  negocio  y  tecnológico,  facilitando  la  correcta  interpretación  de  los  requisitos específicos
contenidos en la Sección 3.

2.1  Perspectiva del Producto

Smooth  Flow  es  un  sistema  de  software  independiente  orientado  a  clínicas  independientes  de  tamaño
pequeño  o  mediano.  No  forma  parte  de  un  sistema  hospitalario  público  ni  de  una  red  clínica  privada
integrada, y no requiere de plataformas externas para su operación central.

El  sistema  opera  como una aplicación web accesible desde cualquier navegador moderno, sin necesidad de
instalación  local.  Su  arquitectura  contempla  tres  capas:  una  interfaz  de  usuario  reactiva  (frontend),  un
servidor  de  lógica  de  negocio  (backend)  y  una base de datos relacional para la persistencia de información
clínico-administrativa.

La  característica  técnica  central  del  sistema  es  el  uso  del  protocolo  WebSocket (RFC 6455) para establecer
canales de comunicación full-duplex persistentes entre el servidor y los clientes conectados. Este mecanismo
sustenta  las  actualizaciones  en  tiempo  real  del  estado  de  la  agenda,  permitiendo  que  cualquier  cambio
generado por una secretaria sea reflejado de forma inmediata en los paneles del médico de turno y viceversa,
sin necesidad de recargar la página ni consultar periódicamente el servidor.

En  su  primera  versión,  Smooth  Flow  no  se integra con sistemas de salud pública, sistemas de teleconsulta,
módulos de facturación, sistemas de prescripción electrónica ni plataformas HL7 FHIR. Estas integraciones se
consideran como posibles extensiones futuras.

2.2  Funcionalidad del Producto

Smooth  Flow organiza sus funcionalidades en tres módulos principales que operan de forma integrada para
cubrir el ciclo completo de gestión de citas médicas:

Módulo

Descripción funcional

Actores principales

Agendamiento
Omnicanal

Gestión Administrativa de
Agenda

Permite a los pacientes reservar, reagendar y cancelar citas a
través de la interfaz web, las 24 horas del día. El sistema valida la
disponibilidad en tiempo real antes de confirmar cualquier
solicitud y registra el estado de cada cita en la base de datos.

Provee al personal de secretaría un panel de control para
visualizar, crear, modificar y cancelar citas. Las modificaciones se
propagan de forma inmediata a todos los usuarios conectados
mediante el canal WebSocket, eliminando la desincronización
entre secretarías y médicos.

Paciente, Secretaria

Secretaria, Dueño /
Médico

Notificaciones en Tiempo
Real

Emite alertas automáticas ante eventos de agendamiento
(reserva, reagendamiento, cancelación) hacia el personal interno

Secretaria, Médico,
Paciente

Módulo

Descripción funcional

Actores principales

a través del protocolo WebSocket y hacia los pacientes a través de
correo electrónico transaccional.

El  flujo  operativo  típico  del  sistema  sigue  la  siguiente  secuencia:  (1)  el  paciente  accede  al  portal  web  y
selecciona un médico y horario disponible; (2) el sistema verifica la disponibilidad en tiempo real y reserva el
bloque;  (3)  se  emite una confirmación por correo electrónico al paciente y una notificación WebSocket a la
las  notificaciones  se  propagan
secretaría  de
automáticamente a todos los actores involucrados sin intervención manual adicional. Este flujo se detalla en
notación BPMN en el Anexo D.

(4)  ante  cualquier  modificación  posterior,

turno;

2.3  Características de los Usuarios

El  sistema  contempla  cuatro  tipos  de  usuario  diferenciados,  con  distintos  niveles  de  acceso,  habilidades
requeridas y actividades permitidas dentro de la plataforma:

Rol

Formación

Secretaria(Usuario
Primario)

Técnico o profesional
en administración de
salud o área afín

Médico de
Turno(Usuario
Final)

Profesional médico o
de la salud

Dueño de la
Clínica(Patrocinado
r / Administrador)

Médico o profesional
de la salud con rol
directivo

Paciente(Beneficia
rio)

Sin requisitos mínimos
de formación

Habilidades / Nivel
técnico

Manejo básico a
intermedio de
aplicaciones web ·
Nivel
básico–intermedio

Manejo básico de
aplicaciones web ·
Nivel básico

Actividades

Creación, modificación y cancelación de
citas; gestión de bloqueos de agenda;
recepción de notificaciones en tiempo real;
visualización del calendario diario y semanal.

Visualización de su agenda del día; recepción
de notificaciones en tiempo real ante
cambios de cita; consulta del historial de
citas propias.

Manejo intermedio de
sistemas web;
comprensión de
métricas operativas ·
Nivel intermedio

Configuración del sistema (médicos,
horarios, especialidades); acceso a reportes
de ocupación; gestión de usuarios del
sistema; visualización de indicadores de
eficiencia administrativa.

Navegación web básica
desde dispositivo
móvil o computador ·
Nivel básico

Reserva, reagendamiento y cancelación de
citas a través del portal web; recepción de
confirmaciones y recordatorios por correo
electrónico.

2.4  Restricciones

Las  restricciones  siguientes  delimitan  el  espacio  de  solución  del  sistema  y  deben  ser  consideradas  como
condiciones no negociables durante el diseño y la implementación:

ID

R-01

El sistema se desarrollará exclusivamente como aplicación web. No contempla versiones nativas para
sistemas operativos móviles (iOS/Android) en esta versión inicial.

Descripción

ID

R-02

R-03

R-04

R-05

R-06

R-07

Descripción

La comunicación en tiempo real entre servidor y clientes debe implementarse obligatoriamente mediante
el protocolo WebSocket (RFC 6455), en su variante segura WSS sobre TLS/SSL en el puerto 443.

El sistema debe cumplir con la Ley N.° 19.628 sobre Protección de la Vida Privada de Chile, implementando
cifrado robusto para la protección de datos sensibles de pacientes.

El sistema debe cumplir con la Ley N.° 20.584 sobre Derechos y Deberes de los Pacientes, garantizando logs
de acceso y auditoría sobre la información clínico-administrativa.

La interfaz de usuario debe ser funcional y compatible con las versiones actuales de los navegadores Google
Chrome, Mozilla Firefox, Microsoft Edge y Safari.

El almacenamiento de datos debe realizarse en un sistema de base de datos relacional. No se contempla el
uso de bases de datos no relacionales como solución principal.

El sistema no incluye en su alcance: módulos de facturación, gestión de fichas clínicas electrónicas,
teleconsulta, prescripción electrónica ni integración directa con sistemas de salud pública
(FONASA/ISAPRE).

2.5  Suposiciones y Dependencias

Las  siguientes  condiciones  se  asumen  como  verdaderas  para  el  correcto  funcionamiento  del  sistema.  Si
alguna de estas suposiciones no se cumple en el entorno de despliegue real, los requisitos asociados deberán
ser revisados.

ID

AS-01

AS-02

AS-03

AS-04

AS-05

AS-06

Suposición / Dependencia

Se asume que la clínica dispone de una red de internet estable con un ancho de banda mínimo de 10 Mbps
para soportar las conexiones WebSocket persistentes del personal interno (secretarías y médicos).

Se asume que el personal administrativo y médico accede al sistema desde dispositivos con pantalla de
resolución mínima de 1024×768 píxeles (computadores de escritorio o laptops).

Se asume que los pacientes acceden al portal de autogestión desde dispositivos modernos (smartphone,
tablet o computador) con navegadores actualizados y conexión a internet.

Se asume que el Equipo de TI de la clínica garantizará la disponibilidad y estabilidad de la infraestructura de
red local, incluyendo la configuración de firewalls para permitir conexiones WebSocket persistentes en el
puerto 443.

El sistema depende de un proveedor externo de correo electrónico transaccional (por ejemplo, SendGrid,
Amazon SES o equivalente) para el envío de notificaciones a pacientes. Si dicho servicio no se encuentra
disponible, las notificaciones por correo quedarán en cola hasta su recuperación.

Se asume que la información inicial de la agenda (médicos, especialidades y horarios base) será cargada
manualmente por el Dueño de la Clínica durante la etapa de configuración inicial del sistema.

2.6  Evolución Previsible del Sistema

Las siguientes funcionalidades se identifican como extensiones naturales del sistema para versiones futuras.
Su  exclusión  del  alcance  actual  no  obedece  a  falta  de  valor,  sino  a  restricciones  de  tiempo, complejidad y
prioridad en esta primera iteración:

ID

Funcionalidad futura

Justificación

EV-01

Integración con estándares HL7
FHIR

Para que a futuro el sistema pueda conectarse y compartir
información clínica de manera estandarizada con sistemas de salud
pública u otros centros médicos.

EV-02

Módulo de telemedicina /
teleconsulta

EV-03

Integración con sistemas
FONASA / ISAPRE

Considerando la Ley N.° 21.541 de Salud Digital, se propone
integrar videollamadas más adelante para las clínicas que ofrecen
consultas online.

Para que el sistema pueda verificar automáticamente si el paciente
tiene cobertura y emitir bonos, ahorrándole ese trabajo manual a
las secretarias.

EV-04

Aplicación móvil nativa (iOS /
Android)

Desarrollar una aplicación nativa para que los pacientes gestionen
sus horas más fácilmente desde el celular, y los médicos puedan
recibir notificaciones push.

EV-05

Módulo de recordatorios
automáticos por SMS y
WhatsApp

Para complementar los correos electrónicos, entendiendo que
muchos pacientes revisan más su WhatsApp que su bandeja de
entrada tradicional.

EV-06

Módulo de reportes y analítica
de ocupación

Para que la administración pueda ver métricas útiles de la clínica,
como la cantidad de pacientes que faltan a sus horas, los horarios
más demandados y estadísticas de atención.

EV-07

Gestión de fichas clínicas
electrónicas

— Fin de la Sección 2 —

Para guardar el historial médico de los pacientes en el sistema. Se
pospone para el futuro porque requiere implementar medidas de
seguridad y privacidad mucho más estrictas exigidas por la Ley N.°
20.584.

3.0  Requisitos Específicos

Esta sección constituye el núcleo normativo del presente documento y detalla, de forma verificable y trazable,
los requisitos que el sistema Smooth Flow debe satisfacer. Se organiza siguiendo la estructura recomendada
por el estándar IEEE 830-1998: requisitos de interfaces externas (3.1), requisitos funcionales (3.2), requisitos
de rendimiento (3.3), restricciones de diseño (3.4), atributos del sistema de software (3.5) y otros requisitos
(3.6).  Cada  requisito  funcional  posee  un  identificador  único  (RF-XX)  que  permite  su  trazabilidad  hacia  los
casos de uso documentados en el Anexo A.

3.1  Requisitos de Interfaces Externas

3.1.1  Interfaces de Usuario

●  El sistema proveerá tres interfaces web diferenciadas por rol: portal de autogestión de pacientes,

panel de gestión para secretaría y panel de agenda para el médico de turno, además de un panel de
configuración para el dueño de la clínica.

●  Las interfaces deben seguir un diseño responsivo, adaptándose a resoluciones desde 360×640 px

(dispositivos móviles de pacientes) hasta 1920×1080 px (estaciones de trabajo administrativas).

●  Los estados de la agenda (disponible, reservado, bloqueado) deben representarse mediante

codificación de color consistente en todas las vistas, conforme al diseño presentado en el Anexo C.

●  Toda actualización proveniente del canal WebSocket debe reflejarse en la interfaz sin recarga de

página, mediante actualización incremental del DOM.

3.1.2  Interfaces de Hardware

●  El sistema no requiere hardware especializado. Los clientes deben contar con un dispositivo

(computador, tablet o smartphone) con conexión a internet y navegador compatible.

●  El servidor de aplicación se ejecutará sobre infraestructura de cómputo estándar (física o

virtualizada/cloud), sin dependencias de hardware propietario.

3.1.3  Interfaces de Software

Componente

Tecnología / Estándar

Propósito

Frontend

Aplicación web reactiva (SPA)

Renderiza las interfaces de usuario y mantiene la
conexión WebSocket persistente con el backend.

Backend

Base de datos

Servicio de correo

Servidor de lógica de negocio
con soporte HTTP/REST y
WebSocket (RFC 6455)

Procesa las solicitudes de agendamiento, valida reglas de
negocio y emite eventos en tiempo real.

Sistema gestor de base de
datos relacional (SQL)

Persiste la información de citas, usuarios, horarios y logs
de auditoría.

API RESTful de proveedor de
correo transaccional (p. ej.
SendGrid, Amazon SES)

Envía confirmaciones y notificaciones por correo
electrónico a los pacientes.

3.1.4  Interfaces de Comunicación

●  Las comunicaciones cliente-servidor de tipo solicitud/respuesta se realizarán mediante el protocolo

HTTPS.

●  Las comunicaciones en tiempo real se realizarán mediante el protocolo WebSocket Secure (WSS),
operando sobre TLS/SSL en el puerto 443, conforme a RFC 6455 [REF-05] y a la restricción R-02.

●  La comunicación con el proveedor de correo electrónico transaccional se realizará mediante una API

RESTful estándar sobre HTTPS.

3.2  Requisitos Funcionales

Los  requisitos  funcionales  se  agrupan  según  los  módulos  definidos  en  la  Sección  2.2.  Cada  requisito  es
verificable  mediante  pruebas  funcionales  y  se  relaciona  con  uno  o  más  casos  de  uso  documentados en el
Anexo A.

3.2.1  Módulo: Agendamiento Omnicanal

ID

RF-01

RF-02

RF-03

Descripción

CU relacionado

El sistema permitirá al paciente reservar una cita seleccionando especialidad, médico y
bloque horario disponible.

UC1

El sistema validará la disponibilidad del horario seleccionado en tiempo real antes de
confirmar la reserva.

UC1, UC4

El sistema permitirá al paciente reagendar una cita existente a un nuevo bloque
horario disponible.

RF-04

El sistema permitirá al paciente cancelar una cita previamente confirmada.

UC2

UC3

RF-05

RF-06

El sistema enviará una confirmación por correo electrónico transaccional al paciente
tras cada reserva, reagendamiento o cancelación exitosa.

UC1, UC2, UC3, UC8

El sistema impedirá la reserva de un bloque horario que ya se encuentre ocupado o
bloqueado, evitando la doble reserva (double booking).

UC1, UC4

3.2.2  Módulo: Gestión Administrativa de Agenda

ID

RF-07

RF-08

RF-09

RF-10

RF-11

Descripción

CU relacionado

El sistema proveerá a la secretaria un panel de control para visualizar el calendario
diario y semanal de citas.

El sistema permitirá a la secretaria crear, modificar y cancelar citas en representación
del paciente.

El sistema permitirá a la secretaria bloquear bloques de agenda (por ejemplo,
ausencias médicas o mantenimiento).

UC7

UC5

UC6

El sistema propagará cualquier modificación de agenda a todos los clientes conectados
(secretarías y médicos) mediante el canal WebSocket, sin requerir recarga de página.

UC5, UC8

El sistema registrará el estado de cada cita (pendiente, confirmada, reagendada,
cancelada) en la base de datos relacional, con marca de tiempo y usuario responsable
del cambio.

UC5

3.2.3  Módulo: Notificaciones en Tiempo Real

ID

RF-12

Descripción

CU relacionado

El sistema emitirá una notificación WebSocket al personal interno (secretaría y médico
de turno) ante cualquier evento de agendamiento (reserva, reagendamiento,
cancelación).

UC8

RF-13

El sistema emitirá una notificación por correo electrónico al paciente ante cualquier
evento de agendamiento que le involucre.

UC1, UC2, UC3

RF-14

El sistema mostrará al médico de turno su agenda del día, actualizada en tiempo real.

UC7, UC8

RF-15

El sistema permitirá al médico de turno consultar el historial de citas propias.

UC9

3.2.4  Módulo: Administración del Sistema

ID

RF-16

RF-17

RF-18

Descripción

CU relacionado

El sistema permitirá al dueño de la clínica configurar médicos, especialidades y
horarios base.

El sistema permitirá al dueño de la clínica gestionar los usuarios del sistema (creación,
edición, desactivación y desvinculación de cuentas de usuarios secundarios).

El sistema generará reportes de ocupación de agenda, accesibles por el dueño de la
clínica.

UC10

UC11

UC12

3.3  Requisitos de Rendimiento

Los siguientes requisitos establecen los umbrales cuantitativos de rendimiento que el sistema debe satisfacer
bajo  condiciones  normales  de  operación.  El  requisito  RNF-01  del  Anexo  B  profundiza  en  la  métrica  de
propagación de eventos en tiempo real.

ID

RND-01

Descripción

El tiempo de respuesta de las solicitudes REST (creación, modificación y cancelación de citas) no deberá
superar los 500 ms en el percentil 95 (p95), medido desde la recepción de la solicitud hasta el envío de la
respuesta.

RND-02

El tiempo de propagación de una actualización de agenda a través del canal WebSocket hacia los clientes
conectados no deberá superar los 2 segundos en el percentil 95 (p95).

RND-03

El sistema deberá soportar al menos 50 conexiones WebSocket concurrentes por instancia de clínica sin
degradación perceptible del tiempo de propagación.

RND-04

Las consultas de disponibilidad y de calendario (diario/semanal) deberán resolverse en un tiempo inferior a
300 ms medido a nivel de base de datos.

3.4  Restricciones de Diseño

Las siguientes restricciones, derivadas de la Sección 2.4 (Restricciones) y de los requisitos legales identificados
en la Sección 1.5, condicionan de forma no negociable las decisiones de diseño e implementación:

●  La comunicación en tiempo real debe implementarse obligatoriamente mediante WebSocket (RFC

6455) en su variante segura WSS/TLS sobre el puerto 443 (deriva de R-02).

●  El almacenamiento de datos debe realizarse exclusivamente en un sistema gestor de bases de datos

relacional (deriva de R-06).

●  El sistema debe desarrollarse como aplicación web; no se contemplan aplicaciones nativas móviles en

esta versión (deriva de R-01).

●  El diseño de la base de datos y de los flujos de acceso debe permitir el cumplimiento de la Ley N.°

19.628 y la Ley N.° 20.584 mediante cifrado de datos sensibles y registro de auditoría (deriva de R-03,
R-04).

3.5  Atributos del Sistema de Software

3.5.1  Confiabilidad

●  Ante la pérdida de conexión WebSocket, el cliente deberá intentar la reconexión automática, con

reintento exponencial, sin pérdida de eventos previamente confirmados.

●  El sistema deberá garantizar una disponibilidad objetivo del 99% durante el horario de atención de la

clínica (definido por el dueño en la configuración inicial).

3.5.2  Disponibilidad

●  Las ventanas de mantenimiento programado deberán ejecutarse fuera del horario de atención

configurado por la clínica, y ser notificadas con al menos 24 horas de anticipación al personal interno.

3.5.3  Seguridad

●  Toda comunicación entre cliente y servidor (REST y WebSocket) deberá cifrarse mediante TLS 1.2 o

superior.

●  El acceso a las funcionalidades del sistema deberá controlarse mediante autenticación y autorización

basada en roles (paciente, secretaria, médico, dueño).

●  La autenticación deberá ser stateful (sesiones server-side), de modo que el backend pueda revocar

de forma inmediata el acceso de un usuario desvinculado o desactivado por el dueño de la clínica.

●  Ante cierre de sesión, revocación administrativa o desconexión WebSocket, el cliente deberá purgar

de inmediato los datos clínico-administrativos de la interfaz y del estado local, sin mantener
información sensible visible ni accesible sin una sesión válida.

●  Todo acceso a información clínico-administrativa deberá quedar registrado en un log de auditoría

inmutable, con retención mínima de 12 meses, conforme a la Ley N.° 20.584 (ver RNF-02, Anexo B).

3.5.4  Mantenibilidad

●  La arquitectura del sistema deberá mantener una separación clara entre frontend, backend y base de

datos, permitiendo el reemplazo o la evolución independiente de cada capa.

●  Las interfaces REST y los eventos WebSocket deberán documentarse formalmente (por ejemplo,

mediante especificación OpenAPI y un catálogo de eventos), facilitando el mantenimiento por parte
de nuevos integrantes del equipo de desarrollo.

3.5.5  Portabilidad

●  La interfaz de usuario deberá operar correctamente en las versiones actuales de Google Chrome,

Mozilla Firefox, Microsoft Edge y Safari (deriva de R-05), sin dependencias de complementos (plugins)
propietarios.

●  El sistema no deberá depender de características específicas del sistema operativo del servidor,

permitiendo su despliegue en distintos proveedores de infraestructura.

3.6  Otros Requisitos

●  El sistema deberá cumplir con la Ley N.° 19.628 sobre Protección de la Vida Privada y la Ley N.°
20.584 sobre Derechos y Deberes de los Pacientes, en todo tratamiento de datos personales y
clínico-administrativos (REF-02, REF-03).

●  El sistema deberá considerar los lineamientos de la Ley N.° 21.541 de Salud Digital respecto a la

equivalencia entre registros digitales y presenciales (REF-04).

●  El modelo de datos deberá diseñarse de forma que facilite una futura integración con estándares HL7

FHIR, sin que ello constituya un requisito de la versión actual (ver EV-01, Sección 2.6).

— Fin de la Sección 3 —

4.0  Anexos

La presente sección reúne los cuatro anexos solicitados como material complementario a la especificación de
requisitos: el Diagrama de Casos de Uso y su documentación (Anexo A), los indicadores de cumplimiento de
requisitos  no  funcionales  clasificados  según  ISO/IEC  9126  y  Sommerville  (Anexo  B), el diseño de interfaces
gráficas (Anexo C) y el diagrama de procesos de negocio en notación BPMN (Anexo D).

Anexo A — Diagrama de Casos de Uso (DCU) y Documentación de Casos de
Uso

El  presente  anexo  contiene  el  Diagrama  de  Casos  de  Uso  (DCU)  del  sistema  Smooth  Flow,  elaborado  en
notación UML, junto con la documentación detallada de cada caso de uso identificado.

Figura A.1 — Diagrama de Casos de Uso del sistema Smooth Flow.

El  diagrama  identifica  cuatro  actores  (Paciente,  Secretaria,  Médico  de  Turno  y  Dueño  de  la Clínica) y doce
casos  de  uso,  incluyendo  relaciones  «include»  hacia  los  casos  de  uso  transversales  UC4  (Verificar
Disponibilidad)  y  UC8  (Recibir  Notificación  en  Tiempo  Real),  que  son  invocados  por  múltiples  flujos  de
agendamiento.

UC1 — Reservar Cita

Actor(es)

Descripción

Paciente (principal)

Permite al paciente reservar una cita médica seleccionando especialidad, médico y
bloque horario disponible a través del portal web de autogestión.

Precondiciones

El paciente ha accedido al portal web de Smooth Flow.

Flujo básico

1. El paciente selecciona la especialidad y el médico deseado.
2. El sistema muestra los bloques horarios disponibles (incluye UC4: Verificar
Disponibilidad).
3. El paciente selecciona un bloque horario.
4. El sistema reserva el bloque y registra la cita con estado "confirmada".
5. El sistema notifica al paciente por correo y a la secretaría/médico mediante WebSocket
(incluye UC8).

Flujos alternativos /
excepciones

3a. El bloque seleccionado deja de estar disponible por concurrencia: el sistema informa
al paciente y solicita seleccionar otro horario.

Postcondiciones

La cita queda registrada en la base de datos con estado "confirmada" y visible en tiempo
real para secretaría y médico.

Frecuencia de uso

Alta (uso diario, múltiples veces por hora en horario de atención).

Requisitos relacionados

RF-01, RF-02, RF-05, RF-06

UC2 — Reagendar Cita

Actor(es)

Descripción

Paciente (principal)

Permite al paciente modificar la fecha/hora de una cita previamente confirmada, sujeto a
disponibilidad.

Precondiciones

El paciente posee una cita confirmada y ha accedido al portal.

Flujo básico

1. El paciente selecciona la cita a reagendar desde su historial.
2. El sistema muestra los bloques horarios disponibles (incluye UC4).
3. El paciente selecciona el nuevo bloque horario.
4. El sistema libera el bloque anterior y reserva el nuevo, actualizando el estado a
"reagendada".
5. El sistema notifica al paciente por correo y al personal interno mediante WebSocket
(incluye UC8).

Flujos alternativos /
excepciones

2a. No existen horarios disponibles para la especialidad/médico seleccionado: el sistema
informa al paciente y sugiere otras fechas.

Postcondiciones

La cita queda con estado "reagendada" y el bloque horario anterior queda liberado para
otros pacientes.

Frecuencia de uso

Media (uso frecuente, varias veces al día).

Requisitos relacionados

RF-03, RF-05

UC3 — Cancelar Cita (Paciente)

Actor(es)

Descripción

Paciente (principal)

Permite al paciente cancelar una cita previamente confirmada, liberando el bloque
horario correspondiente.

Precondiciones

El paciente posee una cita confirmada.

Flujo básico

Flujos alternativos /
excepciones

1. El paciente selecciona la cita a cancelar desde su historial.
2. El sistema solicita confirmación de la cancelación.
3. El paciente confirma la acción.
4. El sistema actualiza el estado de la cita a "cancelada" y libera el bloque horario.
5. El sistema notifica al paciente por correo y al personal interno mediante WebSocket
(incluye UC8).

3a. El paciente cancela la acción de cancelar: no se realiza ningún cambio en la agenda.

Postcondiciones

La cita queda con estado "cancelada" y el bloque horario vuelve a estar disponible.

Frecuencia de uso

Media (uso frecuente).

Requisitos relacionados

RF-04, RF-05

UC4 — Verificar Disponibilidad

Actor(es)

Sistema (caso de uso incluido)

Descripción

Precondiciones

Flujo básico

Caso de uso incluido por UC1, UC2 y UC3; verifica en tiempo real que el bloque horario
solicitado no se encuentre ocupado ni bloqueado antes de confirmar una operación de
agendamiento.

Se ha iniciado una operación de reserva, reagendamiento o creación/modificación de
cita.

1. El sistema consulta el estado del bloque horario solicitado en la base de datos.
2. Si el bloque está libre, se retorna disponibilidad positiva al caso de uso invocante.
3. Si el bloque está ocupado o bloqueado, se retorna disponibilidad negativa.

Flujos alternativos /
excepciones

1a. Se detecta un intento de reserva simultánea sobre el mismo bloque (condición de
carrera): el sistema aplica bloqueo transaccional y solo confirma la primera solicitud
recibida.

Postcondiciones

Se informa al caso de uso invocante si el bloque horario puede reservarse o no.

Frecuencia de uso

Muy alta (se ejecuta en cada operación de agendamiento).

Requisitos relacionados

RF-02, RF-06

UC5 — Gestionar Agenda (Crear / Modificar / Cancelar Cita)

Actor(es)

Descripción

Secretaria (principal)

Permite a la secretaria administrar citas en representación de los pacientes: creación,
modificación y cancelación desde el panel de gestión.

Precondiciones

La secretaria ha iniciado sesión en el panel de gestión de agenda.

Flujo básico

1. La secretaria selecciona la acción a realizar (crear, modificar o cancelar).
2. El sistema solicita los datos requeridos (paciente, médico, horario).
3. El sistema valida la operación (incluye UC4 cuando corresponde).
4. El sistema registra el cambio y actualiza el estado de la cita.
5. El sistema propaga la actualización a todos los clientes conectados mediante
WebSocket (incluye UC8).

Flujos alternativos /
excepciones

3a. El horario solicitado no está disponible: el sistema informa a la secretaria y solicita
seleccionar otro bloque.

Postcondiciones

La agenda queda actualizada y sincronizada en tiempo real para todos los usuarios
internos conectados.

Frecuencia de uso

Muy alta (actividad principal del rol Secretaria durante el horario de atención).

Requisitos relacionados

RF-08, RF-10, RF-11

UC6 — Bloquear Agenda

Actor(es)

Descripción

Secretaria (principal)

Permite a la secretaria bloquear uno o más bloques horarios de un médico (por ejemplo,
ausencias, licencias o mantenimiento), impidiendo que sean reservados por pacientes.

Precondiciones

La secretaria ha iniciado sesión en el panel de gestión de agenda.

Flujo básico

1. La secretaria selecciona el médico y el rango de fecha/hora a bloquear.
2. El sistema valida que no existan citas confirmadas en conflicto.
3. El sistema registra el bloqueo y actualiza la disponibilidad del médico.
4. El sistema propaga la actualización mediante WebSocket (incluye UC8).

Flujos alternativos /
excepciones

2a. Existen citas confirmadas dentro del rango a bloquear: el sistema advierte a la
secretaria y solicita gestionar dichas citas antes de confirmar el bloqueo.

Postcondiciones

El rango horario queda marcado como no disponible para agendamiento por parte de los
pacientes.

Frecuencia de uso

Baja a media (uso esporádico, según necesidad operativa).

Requisitos relacionados

RF-09

UC7 — Visualizar Calendario

Actor(es)

Descripción

Secretaria, Médico de Turno

Permite a la secretaria y al médico de turno visualizar el calendario de citas en formato
diario y semanal, con el estado actualizado de cada bloque horario.

Precondiciones

El usuario ha iniciado sesión en su panel correspondiente.

Flujo básico

1. El usuario selecciona la vista deseada (diaria o semanal).
2. El sistema consulta y muestra las citas correspondientes con su estado (disponible,
confirmada, bloqueada).
3. El sistema mantiene la vista sincronizada en tiempo real ante cualquier cambio (incluye
UC8).

Flujos alternativos /
excepciones

No se identifican flujos alternativos relevantes; los errores de carga se gestionan
mediante reintento automático de la consulta.

Postcondiciones

El usuario visualiza el estado vigente y actualizado de la agenda.

Frecuencia de uso

Muy alta (consulta constante durante el horario de atención).

Requisitos relacionados

RF-07, RF-14

UC8 — Recibir Notificación en Tiempo Real

Actor(es)

Secretaria, Médico de Turno (caso de uso incluido)

Descripción

Caso de uso incluido por UC1, UC2, UC3 y UC5; emite y entrega notificaciones
instantáneas al personal interno conectado ante cualquier evento de agendamiento,
mediante el canal WebSocket.

Precondiciones

El usuario interno mantiene una sesión activa con conexión WebSocket establecida.

Flujo básico

1. El backend detecta un evento de agendamiento (reserva, reagendamiento, cancelación
o bloqueo).
2. El backend construye el mensaje de notificación correspondiente.
3. El backend emite el mensaje a través del canal WebSocket a los clientes suscritos.
4. El cliente recibe el mensaje y actualiza la interfaz sin recargar la página.

Flujos alternativos /
excepciones

Postcondiciones

3a. El cliente se encuentra desconectado: el mensaje no se entrega en tiempo real; al
reconectar, el cliente sincroniza el estado vigente mediante una consulta REST de
respaldo.

El personal interno conectado visualiza el estado actualizado de la agenda de forma
inmediata.

Frecuencia de uso

Muy alta (se ejecuta en cada evento de agendamiento del sistema).

Requisitos relacionados

RF-10, RF-12, RF-14

UC9 — Consultar Historial de Citas

Actor(es)

Descripción

Médico de Turno (principal)

Permite al médico de turno consultar el historial de citas propias, incluyendo citas
pasadas y futuras.

Precondiciones

El médico ha iniciado sesión en su panel.

Flujo básico

Flujos alternativos /
excepciones

1. El médico accede a la sección de historial de citas.
2. El sistema consulta y presenta las citas asociadas al médico, con filtros por fecha y
estado.

No se identifican flujos alternativos relevantes.

Postcondiciones

El médico visualiza el historial completo de sus citas.

Frecuencia de uso

Baja a media (uso ocasional).

Requisitos relacionados

RF-15

UC10 — Configurar Sistema

Actor(es)

Descripción

Dueño de la Clínica (principal)

Permite al dueño de la clínica configurar los parámetros base del sistema: médicos,
especialidades y horarios de atención.

Precondiciones

El dueño ha iniciado sesión en el panel de administración.

Flujo básico

1. El dueño accede al módulo de configuración.
2. El dueño registra o edita médicos, especialidades y horarios base.
3. El sistema valida y almacena la configuración.

Flujos alternativos /
excepciones

2a. Se ingresan datos incompletos o inconsistentes (por ejemplo, horarios superpuestos):
el sistema rechaza el guardado e indica el error.

Postcondiciones

La configuración base queda disponible para el módulo de Agendamiento Omnicanal.

Frecuencia de uso

Baja (principalmente durante la puesta en marcha y ante cambios administrativos).

Requisitos relacionados

RF-16

UC11 — Gestionar Usuarios

Actor(es)

Descripción

Dueño de la Clínica (principal)

Permite al dueño de la clínica crear, editar, desactivar y desvincular las cuentas de
usuario del personal interno (secretarías y médicos).

Precondiciones

El dueño ha iniciado sesión en el panel de administración.

Flujo básico

1. El dueño accede al módulo de gestión de usuarios.
2. El dueño crea, edita, desactiva o desvincula una cuenta, asignando el rol correspondiente.
3. El sistema valida y almacena el cambio, actualizando los permisos de acceso.
4. Si el usuario fue desvinculado o desactivado, el sistema invalida sus sesiones activas y cierra
sus conexiones WebSocket; el cliente purga los datos sensibles de la interfaz.

Flujos alternativos /
excepciones

2a. Se intenta desactivar la única cuenta con rol "Dueño": el sistema rechaza la operación
para evitar la pérdida de acceso administrativo.

2b. Se intenta desvincular al dueño de la clínica: el sistema rechaza la operación.

Postcondiciones

Los permisos de acceso del usuario quedan actualizados en el sistema. Si fue desvinculado o
desactivado, el usuario no mantiene sesión activa ni acceso a datos clínico-administrativos.

Frecuencia de uso

Baja (uso esporádico).

Requisitos relacionados

RF-17

UC12 — Ver Reportes de Ocupación

Actor(es)

Descripción

Dueño de la Clínica (principal)

Permite al dueño de la clínica visualizar reportes de ocupación de agenda por médico,
especialidad y periodo.

Precondiciones

El dueño ha iniciado sesión en el panel de administración.

Flujo básico

Flujos alternativos /
excepciones

1. El dueño accede al módulo de reportes.
2. El dueño selecciona el periodo y los filtros deseados.
3. El sistema calcula y presenta los indicadores de ocupación correspondientes.

No se identifican flujos alternativos relevantes.

Postcondiciones

El dueño visualiza los indicadores de ocupación del periodo seleccionado.

Frecuencia de uso

Baja a media (revisión periódica, por ejemplo semanal o mensual).

Requisitos relacionados

RF-18

Anexo B — Indicadores de Cumplimiento de Requisitos No Funcionales

Este anexo define dos indicadores de cumplimiento para requisitos no funcionales (NFR) críticos del sistema
Smooth Flow. Cada indicador se clasifica según las categorías y subcategorías del modelo de calidad ISO/IEC
9126-1:2001  [REF-09] y, adicionalmente, según la categorización de requisitos no funcionales propuesta por
Ian Sommerville [REF-10], que distingue entre requisitos de producto, requisitos organizacionales y requisitos
externos.

La selección de estos dos NFR no es arbitraria: ambos derivan directamente de restricciones no negociables
del sistema (R-02 y R-03/R-04, Sección 2.4) y de la característica arquitectónica central de Smooth Flow, el uso
de comunicación WebSocket en tiempo real sobre datos clínico-administrativos sensibles. El primer indicador
(RNF-01) valida que la propiedad diferenciadora del producto —la sincronización en tiempo real— se cumpla
con una métrica objetiva; el segundo (RNF-02) valida que dicha sincronización no comprometa la protección
legal de los datos de salud exigida por la Ley N.° 19.628 y la Ley N.° 20.584.

B.1  Marco de Referencia

Modelo ISO/IEC 9126-1

El  modelo  ISO/IEC  9126-1  organiza la calidad del software en seis características principales: Funcionalidad,
Confiabilidad  (Reliability),  Usabilidad,  Eficiencia,  Mantenibilidad  y  Portabilidad,  cada  una  compuesta  por
subcaracterísticas  específicas.  Este  documento  utiliza  la  subcaracterística  Comportamiento  en  el  Tiempo
(Time  Behaviour),  perteneciente  a  Eficiencia,  y  la  subcaracterística  Seguridad  (Security),  perteneciente  a
Funcionalidad.

Clasificación de Sommerville

Sommerville clasifica los requisitos no funcionales en tres grupos: (a) Requisitos de Producto, que especifican
el  comportamiento  del  producto  (por  ejemplo,  rendimiento,  usabilidad,  confiabilidad);  (b)  Requisitos
Organizacionales,  derivados  de  políticas  y  procedimientos  de  la  organización  cliente  y  desarrolladora; y (c)
Requisitos  Externos,  derivados  de  factores  externos  al  sistema  y  su  proceso  de  desarrollo,  incluyendo
requisitos  legales  y  regulatorios.  Dentro  de  los  Requisitos  de  Producto,  distingue  subcategorías  como
requisitos  de  eficiencia  (rendimiento,  uso  de  recursos)  y  requisitos  de  confiabilidad  (dependability),  esta
última incluyendo disponibilidad, tolerancia a fallos y seguridad (security).

B.2  Indicador RNF-01 — Latencia de Propagación en Tiempo Real

Campo

Requisito asociado

Detalle

RND-02 (Sección 3.3) y RF-10, RF-12 (Sección 3.2) — actualización de agenda
mediante WebSocket.

Categoría ISO/IEC 9126

Eficiencia (Efficiency)

Subcategoría ISO/IEC 9126

Comportamiento en el Tiempo (Time Behaviour): grado en que el software responde
y procesa dentro de tiempos adecuados al ejecutar sus funciones.

Clasificación Sommerville

Requisito de Producto → Requisito de Eficiencia → Requisito de Rendimiento
(Performance Requirement).

Campo

Detalle

Definición del indicador

Porcentaje de eventos de agendamiento (reserva, reagendamiento, cancelación o
bloqueo) cuya notificación WebSocket es recibida y renderizada por los clientes
conectados (secretaría, médico) dentro de un plazo máximo de 2 segundos desde la
confirmación del evento en el backend.

Fórmula

Cumplimiento (%) = (N.° de eventos propagados en ≤ 2 s / N.° total de eventos de
agendamiento en el periodo medido) × 100

Meta de cumplimiento

≥ 95% de los eventos propagados dentro del umbral, medido bajo una carga de hasta
50 conexiones WebSocket concurrentes (RND-03).

Método de medición

Instrumentación del backend (marca de tiempo al emitir el evento) y del cliente
(marca de tiempo al renderizar la actualización), con cálculo de la diferencia
(round-trip de propagación) agregada en ventanas de una semana operativa.

Justificación: la propiedad central que distingue a Smooth Flow de una agenda tradicional basada en recarga
manual  es  la  sincronización  en  tiempo  real  habilitada  por  WebSocket  (Sección  2.1,  R-02).  Sin  un  umbral
cuantificable  de  latencia,  este  atributo  diferenciador  no  sería  verificable  ni  auditable,  incumpliendo  el
principio  IEEE  830  de  requisitos  verificables.  La  clasificación  como  requisito  de  producto/eficiencia
(Sommerville)  es  consistente  con  su  naturaleza:  describe  cuán  rápido  responde  el  sistema,  no una política
organizacional ni una obligación legal externa.

B.3  Indicador RNF-02 — Protección y Auditoría de Datos Clínico-Administrativos

Campo

Detalle

Requisito asociado

R-03, R-04 (Sección 2.4) y Sección 3.5.3 (Seguridad) — cifrado y logs de auditoría.

Categoría ISO/IEC 9126

Funcionalidad (Functionality)

Subcategoría ISO/IEC 9126

Seguridad (Security): capacidad del software de proteger la información y los datos
de forma que las personas o sistemas no autorizados no puedan leerlos ni
modificarlos, y que no se niegue el acceso a quienes están autorizados.

Clasificación Sommerville

Requisito Externo → Requisito Legal / Regulatorio, con manifestación como Requisito
de Producto → Requisito de Confiabilidad (Dependability) → Requisito de Seguridad
(Security Requirement). Se clasifica en ambas dimensiones porque su origen es una
obligación legal externa (Ley N.° 19.628, Ley N.° 20.584), pero su cumplimiento se
verifica como un atributo del producto.

Definición del indicador

Porcentaje de comunicaciones cliente-servidor cifradas mediante TLS 1.2+
(HTTPS/WSS) y porcentaje de accesos a información clínico-administrativa que
quedan registrados en el log de auditoría inmutable.

Fórmula

Cumplimiento (%) = (N.° de transacciones cifradas y auditadas conforme a la política /
N.° total de transacciones sobre datos clínico-administrativos) × 100

Meta de cumplimiento

Método de medición

100% de las comunicaciones cifradas (sin excepción) y 100% de los accesos a datos
sensibles registrados en el log de auditoría, con retención mínima de 12 meses
conforme a la Ley N.° 20.584.

Auditoría técnica periódica (escaneo de configuración TLS en todos los endpoints) y
verificación de completitud del log de auditoría mediante comparación contra el total
de transacciones registradas en la base de datos.

Justificación:  a  diferencia  de  RNF-01, este indicador no nace de una decisión de diseño interna sino de una
obligación legal externa e inevitable (Ley N.° 19.628 sobre protección de la vida privada y Ley N.° 20.584 sobre
derechos y deberes de los pacientes, ambas citadas en la Sección 1.0 e identificadas como restricciones R-03
y  R-04).  Por  ello  se  clasifica  primariamente  como  requisito  externo  según  Sommerville,  aun  cuando  su
implementación  se  manifieste  como  un  atributo  de  confiabilidad/seguridad  del  producto.  Su  meta  de
cumplimiento se fija en 100%, sin margen de tolerancia, dado que se trata de una obligación regulatoria y no
de un objetivo de calidad negociable.

B.4  Síntesis Comparativa

Indicador

Categoría ISO/IEC 9126

Clasificación Sommerville

Meta

RNF-01

Eficiencia → Comportamiento
en el Tiempo

Producto → Eficiencia → Rendimiento

≥ 95% ≤ 2 s

RNF-02

Funcionalidad → Seguridad

Externo (legal) → Producto → Confiabilidad
→ Seguridad

100%

Anexo C — Diseño de Interfaces Gráficas

Este  anexo  presenta  el  diseño  de baja/media fidelidad (wireframes) de las principales pantallas del sistema
Smooth  Flow,  una  por  cada  rol  de  usuario  definido  en la Sección 2.3, más una vista de indicadores para el
dueño  de  la  clínica.  El  diseño  busca  mantener  consistencia  visual  entre  paneles,  utilizando codificación de
color  por estado (disponible, confirmado, bloqueado/alerta) y un indicador explícito de conexión en tiempo
real (WSS) en los paneles internos.

Figura C.1 — Wireframes de las interfaces principales: portal de autogestión del paciente (arriba izquierda), panel de
gestión de agenda de la secretaría con indicador de conexión en vivo (arriba derecha), panel de agenda del médico de
turno con banner de notificación (abajo izquierda) e indicadores de ocupación para el dueño de la clínica (abajo derecha).

Portal  del  Paciente:  prioriza  la  selección  progresiva  (especialidad/médico  →  horario)  sobre  una  grilla  de
disponibilidad  con  codificación  de  color,  minimizando  la  carga  cognitiva  para  un  usuario  sin  requisitos
mínimos de formación técnica (Sección 2.3, Rol Paciente).

Panel de Secretaría: organiza la vista semanal en columnas por día, con un indicador permanente de conexión
WebSocket  activa  ("En  vivo"),  reforzando  visualmente  el  requisito  RF-10  de  propagación  inmediata  de
cambios.

Panel del Médico de Turno: destaca mediante un banner superior las notificaciones de cambio de agenda más
recientes, seguido de una lista de la agenda del día con estado de cada cita, alineado con RF-14 y UC8.

Panel del Dueño de la Clínica: resume la ocupación semanal en un gráfico de barras y muestra un ejemplo de
la notificación por correo enviada al paciente, permitiendo validar de forma conjunta RF-05, RF-13 y RF-18.

Anexo D — Diagrama de Procesos de Negocio (BPMN)

Este  anexo  presenta  el modelamiento en notación BPMN (Business Process Model and Notation) de nivel 1
del principal proceso de negocio del sistema Smooth Flow: el proceso de agendamiento de una cita médica,
desde el acceso del paciente al portal hasta la sincronización de la agenda actualizada entre la secretaría y el
médico  de  turno.  El  diagrama  se  organiza  en  un  pool  ("Smooth  Flow") con cuatro carriles (lanes), uno por
cada  actor/componente  involucrado:  Paciente,  Sistema  Smooth  Flow  (backend/WebSocket),  Secretaria  y
Médico de Turno.

Figura D.1 — Diagrama BPMN (Nivel 1) del proceso de agendamiento de citas.

El proceso se describe a continuación, en correspondencia con los requisitos funcionales de la Sección 3.2:

●  El paciente accede al portal web y selecciona médico y horario (RF-01), dando inicio al proceso.

●  El sistema evalúa, mediante una compuerta exclusiva, si el horario solicitado se encuentra disponible
(RF-02, RF-06 / UC4). En caso negativo, se muestran horarios alternativos y el flujo retorna a la
actividad de selección.

●  En caso afirmativo, el sistema reserva el bloque en la base de datos (RF-01) y, en paralelo, emite una
confirmación por correo electrónico al paciente (RF-05, RF-13) y una notificación WebSocket al
personal interno (RF-10, RF-12).

●  La secretaría visualiza la actualización en su panel sin necesidad de recargar la página, alcanzando el

estado final "agenda sincronizada" (RF-07, RF-10, UC7).

●  El médico de turno recibe la notificación de cambio de agenda de forma equivalente, alcanzando el

estado final "agenda actualizada" (RF-14, UC8).

Este proceso constituye el flujo operativo típico descrito en la Sección 2.2 y es la base sobre la cual se derivan
los requisitos de rendimiento RND-01 y RND-02 (Sección 3.3), así como el indicador de cumplimiento RNF-01
(Anexo  B),  que  cuantifica  el  tiempo  de  propagación  entre  la  reserva  del  bloque  y  la  recepción  de  la
notificación por parte de secretaría y médico.