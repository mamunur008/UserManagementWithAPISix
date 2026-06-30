--
-- PostgreSQL database dump
--

\restrict y4QDurWgyhQtsizeSUkJXwLe7o1u9HuL9kUM9uXgrey3yhP4BhIXN9tCOXsALrq

-- Dumped from database version 15.18 (Ubuntu 15.18-1.pgdg24.04+1)
-- Dumped by pg_dump version 15.18 (Ubuntu 15.18-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_key; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.api_key (
    id character varying(255) NOT NULL,
    account_id bigint,
    api_key character varying(1000),
    revoke_reason character varying(255),
    voided boolean DEFAULT false,
    created_at bigint,
    deleted_at bigint,
    updated_at bigint,
    created_by character varying(255),
    updated_by character varying(255),
    deleted_by character varying(255),
    server_version integer
);


ALTER TABLE public.api_key OWNER TO catena;

--
-- Name: menu_item; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.menu_item (
    id uuid NOT NULL,
    name character varying(120),
    url character varying(400),
    icon character varying(80),
    parent_id uuid,
    order_index integer DEFAULT 0,
    is_public boolean DEFAULT false,
    active boolean DEFAULT true,
    voided boolean DEFAULT false,
    created_at bigint,
    updated_at bigint,
    deleted_at bigint,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    server_version integer DEFAULT 0
);


ALTER TABLE public.menu_item OWNER TO catena;

--
-- Name: menu_role; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.menu_role (
    menu_item_id uuid NOT NULL,
    role_id uuid NOT NULL
);


ALTER TABLE public.menu_role OWNER TO catena;

--
-- Name: organization; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.organization (
    id uuid NOT NULL,
    name character varying(160),
    type_id uuid,
    parent_id uuid,
    commission_rate numeric(5,2),
    active boolean DEFAULT true,
    voided boolean DEFAULT false,
    created_at bigint,
    updated_at bigint,
    deleted_at bigint,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    server_version integer DEFAULT 0
);


ALTER TABLE public.organization OWNER TO catena;

--
-- Name: organization_type; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.organization_type (
    id uuid NOT NULL,
    name character varying(80),
    code character varying(40)
);


ALTER TABLE public.organization_type OWNER TO catena;

--
-- Name: payment_account; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.payment_account (
    id uuid NOT NULL,
    organization_id uuid,
    type character varying(16),
    holder character varying(160),
    details jsonb,
    chart_of_account_id uuid,
    is_default boolean DEFAULT false,
    active boolean DEFAULT true,
    voided boolean DEFAULT false,
    created_at bigint,
    updated_at bigint,
    deleted_at bigint,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    server_version integer DEFAULT 0
);


ALTER TABLE public.payment_account OWNER TO catena;

--
-- Name: role; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.role (
    id uuid NOT NULL,
    keycloak_role_id uuid,
    name_cache character varying(120),
    is_global boolean DEFAULT false,
    is_elevated boolean DEFAULT false,
    description character varying(400),
    voided boolean DEFAULT false,
    created_at bigint,
    updated_at bigint,
    deleted_at bigint,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    server_version integer DEFAULT 0
);


ALTER TABLE public.role OWNER TO catena;

--
-- Name: role_org_type; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.role_org_type (
    role_id uuid NOT NULL,
    organization_type_id uuid NOT NULL
);


ALTER TABLE public.role_org_type OWNER TO catena;

--
-- Name: saga_log; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.saga_log (
    id uuid NOT NULL,
    operation character varying(40),
    state character varying(16),
    idempotency_key character varying(120),
    target_ref character varying(160),
    payload jsonb,
    attempts integer DEFAULT 0,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.saga_log OWNER TO catena;

--
-- Name: server_version; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.server_version (
    id bigint NOT NULL
);


ALTER TABLE public.server_version OWNER TO catena;

--
-- Name: server_version_id_seq; Type: SEQUENCE; Schema: public; Owner: catena
--

CREATE SEQUENCE public.server_version_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.server_version_id_seq OWNER TO catena;

--
-- Name: server_version_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: catena
--

ALTER SEQUENCE public.server_version_id_seq OWNED BY public.server_version.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    user_name character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    is_superuser boolean DEFAULT false,
    auth_token character varying(255),
    refresh_token character varying(255),
    password character varying(255),
    last_login bigint,
    fb_token character varying(255),
    is_active boolean,
    password_token character varying(255),
    password_token_expired bigint,
    voided boolean DEFAULT false,
    created_at bigint,
    deleted_at bigint,
    updated_at bigint,
    created_by character varying(255),
    updated_by character varying(255),
    deleted_by character varying(255),
    server_version integer
);


ALTER TABLE public."user" OWNER TO catena;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: catena
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO catena;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: catena
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.user_profile (
    id character varying(255) NOT NULL,
    address character varying(255),
    gender character varying(255),
    contact_no character varying(255),
    blood_group character varying(255),
    date_of_birth boolean DEFAULT false,
    user_id integer,
    voided boolean DEFAULT false,
    created_at bigint,
    deleted_at bigint,
    updated_at bigint,
    created_by integer,
    updated_by integer,
    deleted_by integer,
    server_version integer
);


ALTER TABLE public.user_profile OWNER TO catena;

--
-- Name: user_ref; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.user_ref (
    id uuid NOT NULL,
    keycloak_user_id uuid,
    username_cache character varying(160),
    email_cache character varying(254),
    organization_id uuid,
    bio text,
    avatar_url character varying(512),
    phone character varying(40),
    active boolean DEFAULT true,
    voided boolean DEFAULT false,
    created_at bigint,
    updated_at bigint,
    deleted_at bigint,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    server_version integer DEFAULT 0
);


ALTER TABLE public.user_ref OWNER TO catena;

--
-- Name: user_role; Type: TABLE; Schema: public; Owner: catena
--

CREATE TABLE public.user_role (
    user_ref_id uuid NOT NULL,
    role_id uuid NOT NULL,
    synced_at timestamp with time zone
);


ALTER TABLE public.user_role OWNER TO catena;

--
-- Name: server_version id; Type: DEFAULT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.server_version ALTER COLUMN id SET DEFAULT nextval('public.server_version_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: api_key; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.api_key (id, account_id, api_key, revoke_reason, voided, created_at, deleted_at, updated_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
\.


--
-- Data for Name: menu_item; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.menu_item (id, name, url, icon, parent_id, order_index, is_public, active, voided, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
\.


--
-- Data for Name: menu_role; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.menu_role (menu_item_id, role_id) FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.organization (id, name, type_id, parent_id, commission_rate, active, voided, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd	Carnival	5b5e8936-2336-4513-b0d6-d640d45772c0	\N	0.00	t	f	1781332475	1781332475	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	1
dc00dab8-4265-469b-9a92-da8b70e8103f	Star Internet	f29d9b4f-9ad5-4c20-8ea1-477d1448f060	f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd	10.00	t	f	1781332627	1781332627	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	2
999b09f6-4611-4441-ae9f-7e6c01f1fc43	Infinity Network Solution	f29d9b4f-9ad5-4c20-8ea1-477d1448f060	f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd	12.00	t	f	1781332651	1781332651	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	3
\.


--
-- Data for Name: organization_type; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.organization_type (id, name, code) FROM stdin;
5b5e8936-2336-4513-b0d6-d640d45772c0	Mother organization	MOTHER ORGANIZATION
f29d9b4f-9ad5-4c20-8ea1-477d1448f060	Partner Organization	PARTNER ORGANIZATION
4a40faf0-d537-43f3-adad-c4796d3bbe5b	Vendor	VENDOR
\.


--
-- Data for Name: payment_account; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.payment_account (id, organization_id, type, holder, details, chart_of_account_id, is_default, active, voided, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
a42cc35c-d689-48cb-9e78-dad2b22aea43	999b09f6-4611-4441-ae9f-7e6c01f1fc43	bank	Probe Operating Acct	{"bankName": "Demo Bank", "accountNumber": "000123456"}	\N	f	t	f	1781496462	1781496462	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	15
aed93ba0-c7e1-495e-9d81-e1b50c5e3d50	999b09f6-4611-4441-ae9f-7e6c01f1fc43	mobile	Probe Wallet	{"number": "017xxxxxxxx", "provider": "bKash"}	\N	t	t	f	1781496478	1781496478	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	16
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.role (id, keycloak_role_id, name_cache, is_global, is_elevated, description, voided, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
6a2b9de8-4b16-4e42-b5df-19224c7c3fcb	99cdd433-5b00-4eab-b1ef-61845e233047	Customer	t	f	Customer	f	1781346066	1781346066	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	8
2c195625-54b7-418f-b381-5c02a3602378	69130a9f-e7bd-4104-b22a-69faf97a3d55	Probe Regional Auditor	f	t	probe	f	1781504532	1781504532	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	17
\.


--
-- Data for Name: role_org_type; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.role_org_type (role_id, organization_type_id) FROM stdin;
2c195625-54b7-418f-b381-5c02a3602378	5b5e8936-2336-4513-b0d6-d640d45772c0
\.


--
-- Data for Name: saga_log; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.saga_log (id, operation, state, idempotency_key, target_ref, payload, attempts, created_at, updated_at) FROM stdin;
347fccfd-e4bf-4be5-82c9-09d5b196d8d8	CREATE_USER	COMPENSATED	42b38b17-753a-4275-9893-5aa7638584eb	77385fb6-d55c-40d6-a1f3-6f738814a6b0	{"localId": "6b79ef44-a329-432e-86d2-49be796f321e", "username": "carnival_admintest", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	0	2026-06-13 14:52:38.661+06	2026-06-13 14:52:38.728+06
10bb2d3b-150c-49a9-94ab-ff53f72286c9	CREATE_USER	ABORTED	05f31845-4aca-4b10-876f-3dd607eb3c94	\N	{"localId": "44269eb6-175b-4db4-ab57-cd80710b7b19", "username": "carnival_admin", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	5	2026-06-13 13:37:34.475+06	2026-06-13 13:37:42.102+06
5182f7f9-77ab-4c46-ba8b-f0b6454869aa	CREATE_USER	COMMITTED	5f3ed77d-2300-4a68-a3d8-ae0a6ccb6d9e	b78a5812-5f3e-4f7f-bff5-ffdcac892c07	{"result": "23c2f038-453a-465f-8e7e-bec1449ed88f", "localId": "23c2f038-453a-465f-8e7e-bec1449ed88f", "username": "carnival_admin", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	0	2026-06-13 13:43:22.726+06	2026-06-13 13:43:22.805+06
0a15d2b4-f3e0-415f-b927-dccb02376637	CREATE_USER	COMMITTED	a0f907ae-6fa9-4573-b76f-a6b7f537bf78	98e4f319-60d3-421c-b312-de7d59b8e05d	{"result": "1ebb944c-93d7-4583-a867-d6ba5e954874", "localId": "1ebb944c-93d7-4583-a867-d6ba5e954874", "username": "carnival_admin", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	0	2026-06-13 14:05:09.438+06	2026-06-13 14:05:09.507+06
feff22d6-f032-4d15-8385-e5ae4b7c482a	CREATE_USER	COMMITTED	736fe98b-1508-40d1-8468-84c528b19060	cbcbe400-be4d-435b-b3a8-d943ea3c60f2	{"result": "efcb9b7d-4a70-4a9f-8eba-1ccd5fe91fa5", "localId": "efcb9b7d-4a70-4a9f-8eba-1ccd5fe91fa5", "username": "carnival_admin", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	0	2026-06-13 14:15:58.256+06	2026-06-13 14:15:58.356+06
05dcb37b-4d41-443e-87d5-8ef398fe493f	CREATE_USER	COMMITTED	bf5bb36f-6648-4c0b-bf09-b236a46c0315	525a8288-b0df-47c0-8649-f6c64a75d8f7	{"result": "cb34b736-ad65-40fa-b005-8faf03c5157d", "localId": "cb34b736-ad65-40fa-b005-8faf03c5157d", "username": "carnival_admintest", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	0	2026-06-13 14:49:36.708+06	2026-06-13 14:49:36.808+06
0535c1ff-3e2e-4a94-a598-7c64f09a0b63	CREATE_ROLE	COMMITTED	7de29c8f-4c7f-43ca-8d3f-6f9668b3b439	99cdd433-5b00-4eab-b1ef-61845e233047	{"name": "Customer", "result": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb", "localId": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb"}	0	2026-06-13 16:21:06.263+06	2026-06-13 16:21:06.329+06
998a6297-8166-4875-96fa-c4569dc4dedc	CREATE_USER	COMMITTED	9b43c077-e237-4975-b77e-217f79d9c69c	4f891b47-068c-4a2a-9817-bc9d560fb0ed	{"result": "02d7c6db-a243-47a0-bb90-3571e10eea94", "localId": "02d7c6db-a243-47a0-bb90-3571e10eea94", "username": "raju_ahmed", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	0	2026-06-13 18:56:54.244+06	2026-06-13 18:56:54.378+06
ba9d29e4-4ed8-422a-b663-fec45636ee91	ASSIGN_ROLE	COMMITTED	274f3203-aa38-4933-8fe9-9a6dac180fc2:99cdd433-5b00-4eab-b1ef-61845e233047	4f891b47-068c-4a2a-9817-bc9d560fb0ed	{"result": "02d7c6db-a243-47a0-bb90-3571e10eea94", "roleId": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb", "userRefId": "02d7c6db-a243-47a0-bb90-3571e10eea94"}	0	2026-06-13 19:04:41.134+06	2026-06-13 19:04:41.174+06
e214457d-3285-4671-9ef5-6f915a3d25c8	CREATE_USER	COMMITTED	zz-test-1781450391	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "localId": "059b4d25-6203-4961-a861-1efe6e2e5c86", "username": "zz_claude_probe", "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd"}	0	2026-06-14 21:19:51.361+06	2026-06-14 21:19:51.631+06
606b69c4-d521-4319-bea6-801694245996	UPDATE_USER	COMMITTED	UPDATE_USER:059b4d25-6203-4961-a861-1efe6e2e5c86:1781450417300	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-14 21:20:17.3+06	2026-06-14 21:20:17.342+06
0edaa245-5767-4507-b0f9-838bc7fe1ace	UPDATE_USER	COMMITTED	UPDATE_USER:059b4d25-6203-4961-a861-1efe6e2e5c86:1781450417366	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-14 21:20:17.366+06	2026-06-14 21:20:17.416+06
3ccc9d01-5ff1-41f1-aab8-8e028ce19b04	DEACTIVATE_USER	COMMITTED	DEACTIVATE_USER:059b4d25-6203-4961-a861-1efe6e2e5c86	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-14 21:20:17.45+06	2026-06-14 21:20:17.511+06
c1a0d8a1-9e4d-43f6-91c5-3fa0837da89f	UPDATE_USER	COMMITTED	UPDATE_USER:059b4d25-6203-4961-a861-1efe6e2e5c86:1781450417565	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-14 21:20:17.565+06	2026-06-14 21:20:17.604+06
3e6a6c40-3fa9-4a12-8b15-9706b304e9f5	ASSIGN_ROLE	COMMITTED	t1	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "roleId": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-15 06:15:20.434+06	2026-06-15 06:15:20.507+06
7430790a-37dc-48c8-9d1a-aaa9c04d7b30	ASSIGN_ROLE	COMMITTED	t2:99cdd433-5b00-4eab-b1ef-61845e233047	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "roleId": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-15 06:15:20.536+06	2026-06-15 06:15:20.556+06
f62e3c6e-043c-415f-9a32-724419e1a541	REMOVE_ROLE	COMMITTED	t3	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "roleId": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-15 06:15:20.576+06	2026-06-15 06:15:20.615+06
d48c5591-3482-4de1-ba4e-f8594f4ed9b7	ASSIGN_ROLE	COMMITTED	a1	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "roleId": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-15 09:10:36.946+06	2026-06-15 09:10:37.005+06
04bceb0e-e5dc-4bd4-a89b-eb03830e5d83	REMOVE_ROLE	COMMITTED	r1	15d41720-def3-4662-9704-fcf0a447db9c	{"result": "059b4d25-6203-4961-a861-1efe6e2e5c86", "roleId": "6a2b9de8-4b16-4e42-b5df-19224c7c3fcb", "userRefId": "059b4d25-6203-4961-a861-1efe6e2e5c86"}	0	2026-06-15 09:10:37.059+06	2026-06-15 09:10:37.088+06
0227eae5-e1b4-4d1c-a17c-6713e0f1614d	CREATE_ROLE	COMMITTED	probe-role-1781504532	69130a9f-e7bd-4104-b22a-69faf97a3d55	{"name": "Probe Regional Auditor", "result": "2c195625-54b7-418f-b381-5c02a3602378", "localId": "2c195625-54b7-418f-b381-5c02a3602378"}	0	2026-06-15 12:22:12.258+06	2026-06-15 12:22:12.329+06
\.


--
-- Data for Name: server_version; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.server_version (id) FROM stdin;
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public."user" (id, user_name, first_name, last_name, email, is_superuser, auth_token, refresh_token, password, last_login, fb_token, is_active, password_token, password_token_expired, voided, created_at, deleted_at, updated_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
\.


--
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.user_profile (id, address, gender, contact_no, blood_group, date_of_birth, user_id, voided, created_at, deleted_at, updated_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
\.


--
-- Data for Name: user_ref; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.user_ref (id, keycloak_user_id, username_cache, email_cache, organization_id, bio, avatar_url, phone, active, voided, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by, server_version) FROM stdin;
efcb9b7d-4a70-4a9f-8eba-1ccd5fe91fa5	cbcbe400-be4d-435b-b3a8-d943ea3c60f2	carnival_admin	admin@carnival.com.bd	f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd			01717234678	t	f	1781338558	1781338558	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	6
02d7c6db-a243-47a0-bb90-3571e10eea94	4f891b47-068c-4a2a-9817-bc9d560fb0ed	raju_ahmed	raju@gmail.com	f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd			01717232670	t	f	1781355414	1781355414	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	9
059b4d25-6203-4961-a861-1efe6e2e5c86	15d41720-def3-4662-9704-fcf0a447db9c	zz_claude_probe	zz_claude_probe@example.com	f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd	reactivated		017777	t	f	1781450391	1781450417	\N	6912d696-9a48-48d4-95d4-7c66a4aeadea	6912d696-9a48-48d4-95d4-7c66a4aeadea	\N	14
\.


--
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: catena
--

COPY public.user_role (user_ref_id, role_id, synced_at) FROM stdin;
02d7c6db-a243-47a0-bb90-3571e10eea94	6a2b9de8-4b16-4e42-b5df-19224c7c3fcb	2026-06-13 19:04:41.171+06
\.


--
-- Name: server_version_id_seq; Type: SEQUENCE SET; Schema: public; Owner: catena
--

SELECT pg_catalog.setval('public.server_version_id_seq', 17, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: catena
--

SELECT pg_catalog.setval('public.user_id_seq', 1, false);


--
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.api_key
    ADD CONSTRAINT api_key_pkey PRIMARY KEY (id);


--
-- Name: menu_item menu_item_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_pkey PRIMARY KEY (id);


--
-- Name: menu_role menu_role_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.menu_role
    ADD CONSTRAINT menu_role_pkey PRIMARY KEY (menu_item_id, role_id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization_type organization_type_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.organization_type
    ADD CONSTRAINT organization_type_pkey PRIMARY KEY (id);


--
-- Name: payment_account payment_account_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.payment_account
    ADD CONSTRAINT payment_account_pkey PRIMARY KEY (id);


--
-- Name: role role_name_cache_key; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_name_cache_key UNIQUE (name_cache);


--
-- Name: role_org_type role_org_type_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.role_org_type
    ADD CONSTRAINT role_org_type_pkey PRIMARY KEY (role_id, organization_type_id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: saga_log saga_log_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.saga_log
    ADD CONSTRAINT saga_log_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: saga_log saga_log_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.saga_log
    ADD CONSTRAINT saga_log_pkey PRIMARY KEY (id);


--
-- Name: server_version server_version_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.server_version
    ADD CONSTRAINT server_version_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- Name: user_ref user_ref_keycloak_user_id_key; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.user_ref
    ADD CONSTRAINT user_ref_keycloak_user_id_key UNIQUE (keycloak_user_id);


--
-- Name: user_ref user_ref_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.user_ref
    ADD CONSTRAINT user_ref_pkey PRIMARY KEY (id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_ref_id, role_id);


--
-- Name: ix_saga_state; Type: INDEX; Schema: public; Owner: catena
--

CREATE INDEX ix_saga_state ON public.saga_log USING btree (operation, state, updated_at);


--
-- Name: user_profile user_profile_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catena
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO catena;


--
-- PostgreSQL database dump complete
--

\unrestrict y4QDurWgyhQtsizeSUkJXwLe7o1u9HuL9kUM9uXgrey3yhP4BhIXN9tCOXsALrq

