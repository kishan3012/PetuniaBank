--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-11 15:12:09

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 217 (class 1259 OID 16397)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    transaction_id integer NOT NULL,
    oauth_sub text,
    amount double precision,
    actiontype text,
    actiondate text
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16404)
-- Name: transactions_transactionID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.transactions ALTER COLUMN transaction_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."transactions_transactionID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 24587)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    oauth_sub text NOT NULL,
    nickname text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4794 (class 0 OID 16397)
-- Dependencies: 217
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (transaction_id, oauth_sub, amount, actiontype, actiondate) FROM stdin;
166	6846fa2e5ee75d13253aaafa	200	deposit	10/06/2025
167	6846fa2e5ee75d13253aaafa	750	deposit	10/06/2025
168	6846fa2e5ee75d13253aaafa	500	withdraw	10/06/2025
169	6846fa2e5ee75d13253aaafa	500	deposit	10/06/2025
170	68480fcd5c7656f7c8a3afa4	750	deposit	10/06/2025
171	68480fcd5c7656f7c8a3afa4	50	withdraw	10/06/2025
172	6846fa2e5ee75d13253aaafa	749.99	deposit	11/06/2025
173	6846fa2e5ee75d13253aaafa	250.01	deposit	11/06/2025
\.


--
-- TOC entry 4796 (class 0 OID 24587)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (oauth_sub, nickname) FROM stdin;
68468fa9793ddea36158a59d	test
6846fa2e5ee75d13253aaafa	admin
6847f408831c6440d74b57d2	broker
68480fcd5c7656f7c8a3afa4	test2
\.


--
-- TOC entry 4802 (class 0 OID 0)
-- Dependencies: 218
-- Name: transactions_transactionID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."transactions_transactionID_seq"', 173, true);


--
-- TOC entry 4646 (class 2606 OID 16406)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- TOC entry 4648 (class 2606 OID 24593)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (oauth_sub, nickname);


-- Completed on 2025-06-11 15:12:09

--
-- PostgreSQL database dump complete
--

