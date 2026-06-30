SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict YRSTDGrUSHeWzmLcXy7X8WmXtrwL6dWg6Sbt560Ib6Z6hPC2E0R4dVIbG07KTPj

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '322258fe-e750-42fe-8fb0-6842986cb316', 'authenticated', 'authenticated', 'blsd.trader@gmail.com', '$2a$10$LnZ1Dkwjr2nOVPi/NaaTP.TAsM2aEhKzYeHOgf4MBTDMfj0Lt/oHa', '2026-06-25 23:56:02.037491+00', NULL, '', '2026-06-25 23:52:53.236609+00', '', NULL, '', '', NULL, '2026-06-26 00:01:10.154062+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "322258fe-e750-42fe-8fb0-6842986cb316", "nome": "tester", "email": "blsd.trader@gmail.com", "perfil": "Comercial", "email_verified": true, "phone_verified": false}', NULL, '2026-06-25 23:52:53.21083+00', '2026-06-26 13:22:41.711532+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', 'authenticated', 'authenticated', 'severinomadureira@vendaia.site', '$2a$10$qh1j1Djg6hbfvJPfv7RkhOUcAZZh2HUEAhiaqC3z2xbE38ovcZwjm', '2026-06-23 20:08:17.227835+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-30 08:49:51.633965+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2", "nome": "Severino Madureira", "email": "severinomadureira@vendaia.site", "perfil": "Comercial", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 18:46:34.674559+00', '2026-06-30 13:04:00.939761+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', 'authenticated', 'authenticated', 'edkassocota@vendaia.site', '$2a$10$VUL8fJ3RKB9nxiQL7dK9TeER7oaPMExRvFD5XsMHa2P2OYCXrlSqi', '2026-06-23 18:21:23.697038+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-30 19:09:24.911555+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-06-23 18:21:23.667811+00', '2026-06-30 19:09:24.930157+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('b980d0d7-b029-4cc6-b36c-776e26f02ccd', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '{"sub": "b980d0d7-b029-4cc6-b36c-776e26f02ccd", "email": "edkassocota@vendaia.site", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 18:21:23.690423+00', '2026-06-23 18:21:23.690487+00', '2026-06-23 18:21:23.690487+00', '4884c916-8876-4c38-bc37-c71e27d37391'),
	('32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', '{"sub": "32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2", "nome": "Severino Madureira", "email": "severinomadureira@vendaia.site", "perfil": "Comercial", "email_verified": true, "phone_verified": false}', 'email', '2026-06-23 18:46:34.699186+00', '2026-06-23 18:46:34.699239+00', '2026-06-23 18:46:34.699239+00', '6e856357-ec81-4799-afba-4940052287d0'),
	('322258fe-e750-42fe-8fb0-6842986cb316', '322258fe-e750-42fe-8fb0-6842986cb316', '{"sub": "322258fe-e750-42fe-8fb0-6842986cb316", "nome": "tester", "email": "blsd.trader@gmail.com", "perfil": "Comercial", "email_verified": true, "phone_verified": false}', 'email', '2026-06-25 23:52:53.229183+00', '2026-06-25 23:52:53.229238+00', '2026-06-25 23:52:53.229238+00', '64f49b78-67ac-41d6-a8c3-7f5bb8795beb');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('fe3bfd32-1584-450a-9de8-ac2c6e9a9343', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 18:32:42.819312+00', '2026-06-28 18:32:42.819312+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('be53178d-5e8f-47b2-9dc6-2556d65fa792', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 18:46:22.046577+00', '2026-06-28 18:46:22.046577+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('4bae58e6-68d4-4df7-a4d9-5492412e90ba', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 18:47:10.474812+00', '2026-06-28 18:47:10.474812+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('73cc8bfd-f769-42b8-8051-b4a02223fe29', '322258fe-e750-42fe-8fb0-6842986cb316', '2026-06-25 23:56:02.05771+00', '2026-06-25 23:56:02.05771+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.172.124.231', NULL, NULL, NULL, NULL, NULL),
	('62a0b93c-37d8-47db-9109-12fff2df48c7', '322258fe-e750-42fe-8fb0-6842986cb316', '2026-06-25 23:57:11.601436+00', '2026-06-26 13:22:41.721714+00', NULL, 'aal1', NULL, '2026-06-26 13:22:41.721605', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.172.190.146', NULL, NULL, NULL, NULL, NULL),
	('fc858a08-159d-4947-9385-ba15667c66b9', '322258fe-e750-42fe-8fb0-6842986cb316', '2026-06-26 00:01:10.154926+00', '2026-06-26 00:01:10.154926+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.172.124.231', NULL, NULL, NULL, NULL, NULL),
	('f0c39faa-e152-4209-8f44-5a08d0d6f69f', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 19:22:41.535881+00', '2026-06-28 19:22:41.535881+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('16ffe5da-c199-4e3d-9a5a-ad1b798aacce', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-26 00:18:25.136708+00', '2026-06-26 00:18:25.136708+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1', '105.172.124.231', NULL, NULL, NULL, NULL, NULL),
	('add84d51-db48-48a9-969f-9a3f900db2c3', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 19:37:42.061031+00', '2026-06-28 19:37:42.061031+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('af84fce4-2585-447a-aa18-cf7df84097f1', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', '2026-06-25 20:11:46.336983+00', '2026-06-26 08:25:04.297825+00', NULL, 'aal1', NULL, '2026-06-26 08:25:04.297695', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36', '105.168.183.130', NULL, NULL, NULL, NULL, NULL),
	('fc014085-7f12-47ca-9f3b-b3b58945963c', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-26 00:25:32.034705+00', '2026-06-28 21:18:39.746498+00', NULL, 'aal1', NULL, '2026-06-28 21:18:39.74638', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('78740415-e5c2-4146-bb0b-6df421a094ca', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-26 00:20:14.631417+00', '2026-06-26 16:54:44.966256+00', NULL, 'aal1', NULL, '2026-06-26 16:54:44.966147', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1', '105.172.190.146', NULL, NULL, NULL, NULL, NULL),
	('a3e9b7f6-6c82-4d12-a7f1-4e1359d546f7', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 21:59:12.614072+00', '2026-06-28 21:59:12.614072+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('ac87d5a2-d7c0-434a-b4e1-1b383e401780', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-26 16:55:29.288895+00', '2026-06-28 22:18:04.898578+00', NULL, 'aal1', NULL, '2026-06-28 22:18:04.89845', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('1d30d941-e29b-4ae9-8193-4a5000d21e08', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 22:19:57.131544+00', '2026-06-28 22:19:57.131544+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('d4f0e830-b370-49e7-9579-fab3de3fc88e', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 22:32:40.54406+00', '2026-06-28 22:32:40.54406+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('c7ef1d5a-0eff-48d7-9ada-78d3abe8e359', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', '2026-06-30 08:49:51.635235+00', '2026-06-30 13:04:00.948945+00', NULL, 'aal1', NULL, '2026-06-30 13:04:00.948838', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.172.136.164', NULL, NULL, NULL, NULL, NULL),
	('e3309af2-ce92-4499-95a4-ac179cf4269c', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-30 09:25:33.755191+00', '2026-06-30 14:16:56.706108+00', NULL, 'aal1', NULL, '2026-06-30 14:16:56.705999', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1', '105.168.16.135', NULL, NULL, NULL, NULL, NULL),
	('08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-26 13:22:53.892056+00', '2026-06-28 18:31:14.30122+00', NULL, 'aal1', NULL, '2026-06-28 18:31:14.301114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('e97dd357-0350-4db3-a31d-69b113b18f81', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 18:31:41.807107+00', '2026-06-28 18:31:41.807107+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('79ef96b8-08a4-4c93-9a16-4b782b8b458d', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 19:48:26.618347+00', '2026-06-28 22:41:05.673172+00', NULL, 'aal1', NULL, '2026-06-28 22:41:05.673051', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.214.60', NULL, NULL, NULL, NULL, NULL),
	('9403057a-1a62-4147-8178-f2c59809102e', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 21:31:42.033699+00', '2026-06-29 19:36:54.199169+00', NULL, 'aal1', NULL, '2026-06-29 19:36:54.19906', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36', '105.172.100.110', NULL, NULL, NULL, NULL, NULL),
	('31811128-7996-4bb8-9ba3-a4dea0e418ab', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-28 22:05:23.016553+00', '2026-06-30 18:43:44.587367+00', NULL, 'aal1', NULL, '2026-06-30 18:43:44.587258', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.16.135', NULL, NULL, NULL, NULL, NULL),
	('b4e63477-5f32-4b29-bebd-f3cd39209bd9', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', '2026-06-30 19:09:24.912636+00', '2026-06-30 19:09:24.912636+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', '105.168.16.135', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('af84fce4-2585-447a-aa18-cf7df84097f1', '2026-06-25 20:11:46.37978+00', '2026-06-25 20:11:46.37978+00', 'password', '97e6550f-8b30-40ea-8bf0-59d33c7088e7'),
	('73cc8bfd-f769-42b8-8051-b4a02223fe29', '2026-06-25 23:56:02.087328+00', '2026-06-25 23:56:02.087328+00', 'otp', '24c2a8c2-c12b-4089-bada-8f6ff38b5dc9'),
	('62a0b93c-37d8-47db-9109-12fff2df48c7', '2026-06-25 23:57:11.605949+00', '2026-06-25 23:57:11.605949+00', 'password', '78f50a82-88d8-4337-ab8c-5b754c296be3'),
	('fc858a08-159d-4947-9385-ba15667c66b9', '2026-06-26 00:01:10.171794+00', '2026-06-26 00:01:10.171794+00', 'password', 'ae7ea673-9a3b-4b7d-ab3b-d5f4e5a480ea'),
	('16ffe5da-c199-4e3d-9a5a-ad1b798aacce', '2026-06-26 00:18:25.143224+00', '2026-06-26 00:18:25.143224+00', 'otp', '28d89a73-4510-4b44-a64c-f49f4f63e8a6'),
	('78740415-e5c2-4146-bb0b-6df421a094ca', '2026-06-26 00:20:14.648209+00', '2026-06-26 00:20:14.648209+00', 'password', 'e770c324-7146-4462-89b4-469dcc16b797'),
	('fc014085-7f12-47ca-9f3b-b3b58945963c', '2026-06-26 00:25:32.064168+00', '2026-06-26 00:25:32.064168+00', 'password', '87a5d213-308b-4e76-8503-483a317c8cd4'),
	('08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542', '2026-06-26 13:22:53.918183+00', '2026-06-26 13:22:53.918183+00', 'password', 'dbd6d295-f531-46b2-bef6-d8107da8dd7b'),
	('ac87d5a2-d7c0-434a-b4e1-1b383e401780', '2026-06-26 16:55:29.31302+00', '2026-06-26 16:55:29.31302+00', 'password', 'a771bf62-c110-4dfa-9fc7-e3b96c0337a0'),
	('e97dd357-0350-4db3-a31d-69b113b18f81', '2026-06-28 18:31:41.844864+00', '2026-06-28 18:31:41.844864+00', 'password', 'fa2a25b3-a16f-4f54-aa6c-bc1047c124f0'),
	('fe3bfd32-1584-450a-9de8-ac2c6e9a9343', '2026-06-28 18:32:42.828496+00', '2026-06-28 18:32:42.828496+00', 'password', '61ac20be-6ef4-4efd-b5fc-e42a45e29fe3'),
	('be53178d-5e8f-47b2-9dc6-2556d65fa792', '2026-06-28 18:46:22.092252+00', '2026-06-28 18:46:22.092252+00', 'password', '19178e62-6356-4d21-97b0-be7d7aa48fd5'),
	('4bae58e6-68d4-4df7-a4d9-5492412e90ba', '2026-06-28 18:47:10.477423+00', '2026-06-28 18:47:10.477423+00', 'password', 'b5e4d728-1ba7-4d9d-ab3f-5af9e86aa2eb'),
	('f0c39faa-e152-4209-8f44-5a08d0d6f69f', '2026-06-28 19:22:41.571216+00', '2026-06-28 19:22:41.571216+00', 'password', '40a22b95-ecfc-4ed4-8b2b-742198763d56'),
	('add84d51-db48-48a9-969f-9a3f900db2c3', '2026-06-28 19:37:42.09206+00', '2026-06-28 19:37:42.09206+00', 'password', '4d7fa706-8a52-4586-985b-8b45f1bdcd2d'),
	('79ef96b8-08a4-4c93-9a16-4b782b8b458d', '2026-06-28 19:48:26.635971+00', '2026-06-28 19:48:26.635971+00', 'password', '0e3a356f-778b-4b9b-a84f-f79e88423647'),
	('9403057a-1a62-4147-8178-f2c59809102e', '2026-06-28 21:31:42.093322+00', '2026-06-28 21:31:42.093322+00', 'password', 'd4964caf-9a6f-452a-8360-fa721ee600f5'),
	('a3e9b7f6-6c82-4d12-a7f1-4e1359d546f7', '2026-06-28 21:59:12.666704+00', '2026-06-28 21:59:12.666704+00', 'password', '5ec5d18b-2c4a-45ec-957b-cb22e070e5eb'),
	('31811128-7996-4bb8-9ba3-a4dea0e418ab', '2026-06-28 22:05:23.050557+00', '2026-06-28 22:05:23.050557+00', 'password', '3304b8e3-5309-4bd4-8e7d-dede3c9dbde7'),
	('1d30d941-e29b-4ae9-8193-4a5000d21e08', '2026-06-28 22:19:57.161546+00', '2026-06-28 22:19:57.161546+00', 'password', 'ff62efb0-8167-42ba-abde-e1944863e3cd'),
	('d4f0e830-b370-49e7-9579-fab3de3fc88e', '2026-06-28 22:32:40.615668+00', '2026-06-28 22:32:40.615668+00', 'password', '11d3f2a3-181d-4e62-8313-1dc453b28c93'),
	('c7ef1d5a-0eff-48d7-9ada-78d3abe8e359', '2026-06-30 08:49:51.697397+00', '2026-06-30 08:49:51.697397+00', 'password', '85e85d5d-cb16-4f33-a49f-49ccf2adc061'),
	('e3309af2-ce92-4499-95a4-ac179cf4269c', '2026-06-30 09:25:33.789979+00', '2026-06-30 09:25:33.789979+00', 'password', 'cb77a824-93e9-41d0-a150-d38f0d7d791f'),
	('b4e63477-5f32-4b29-bebd-f3cd39209bd9', '2026-06-30 19:09:24.939768+00', '2026-06-30 19:09:24.939768+00', 'password', '9138e77c-f903-4eb3-a9a6-cc3ec1ef01dc');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 62, 'lairzs4yazpd', '322258fe-e750-42fe-8fb0-6842986cb316', false, '2026-06-25 23:56:02.068832+00', '2026-06-25 23:56:02.068832+00', NULL, '73cc8bfd-f769-42b8-8051-b4a02223fe29'),
	('00000000-0000-0000-0000-000000000000', 69, 'jw2wozkxxszf', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', false, '2026-06-26 08:25:04.272198+00', '2026-06-26 08:25:04.272198+00', 'dju7rcltyqt2', 'af84fce4-2585-447a-aa18-cf7df84097f1'),
	('00000000-0000-0000-0000-000000000000', 71, 'r7isla52pljb', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 12:08:38.316843+00', '2026-06-26 13:20:16.820291+00', '6cvs3ckdbneo', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 63, 'wg55545iw3pt', '322258fe-e750-42fe-8fb0-6842986cb316', true, '2026-06-25 23:57:11.6046+00', '2026-06-26 13:22:41.703082+00', NULL, '62a0b93c-37d8-47db-9109-12fff2df48c7'),
	('00000000-0000-0000-0000-000000000000', 73, 'es3x3cmcqrsv', '322258fe-e750-42fe-8fb0-6842986cb316', false, '2026-06-26 13:22:41.708579+00', '2026-06-26 13:22:41.708579+00', 'wg55545iw3pt', '62a0b93c-37d8-47db-9109-12fff2df48c7'),
	('00000000-0000-0000-0000-000000000000', 74, 'pgnpvopvk6jy', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 13:22:53.909634+00', '2026-06-26 14:21:01.616577+00', NULL, '08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542'),
	('00000000-0000-0000-0000-000000000000', 67, '7vc3mtit2mog', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 00:20:14.643887+00', '2026-06-26 15:44:50.547063+00', NULL, '78740415-e5c2-4146-bb0b-6df421a094ca'),
	('00000000-0000-0000-0000-000000000000', 76, 'cazhhrbrt3zg', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 14:54:11.303689+00', '2026-06-26 16:00:55.918154+00', '7dnlhhq6c3ov', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 78, 'wuoekgpnvq4a', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 15:44:50.559236+00', '2026-06-26 16:54:44.948797+00', '7vc3mtit2mog', '78740415-e5c2-4146-bb0b-6df421a094ca'),
	('00000000-0000-0000-0000-000000000000', 85, 'cqzivgx4pv5e', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 11:00:35.413061+00', '2026-06-28 13:05:52.591841+00', 'pilwtij4earr', 'ac87d5a2-d7c0-434a-b4e1-1b383e401780'),
	('00000000-0000-0000-0000-000000000000', 83, 'gk3gu2vt255c', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 17:00:24.531325+00', '2026-06-28 16:53:18.167992+00', 'j5i5gsrvnpsa', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 80, '5so34lpemrrl', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 16:50:14.729795+00', '2026-06-28 17:22:13.14387+00', 'yvvprk6u5opz', '08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542'),
	('00000000-0000-0000-0000-000000000000', 87, 'gav7pesrksdt', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 16:53:18.185018+00', '2026-06-28 17:59:28.412628+00', 'gk3gu2vt255c', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 91, 'fi7bzqu66lcg', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 18:31:14.281594+00', '2026-06-28 18:31:14.281594+00', 'vtabp7hscj25', '08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542'),
	('00000000-0000-0000-0000-000000000000', 92, '6yvfkk3p56j4', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 18:31:41.830437+00', '2026-06-28 18:31:41.830437+00', NULL, 'e97dd357-0350-4db3-a31d-69b113b18f81'),
	('00000000-0000-0000-0000-000000000000', 94, '3ebcj7iqpnw5', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 18:46:22.070357+00', '2026-06-28 18:46:22.070357+00', NULL, 'be53178d-5e8f-47b2-9dc6-2556d65fa792'),
	('00000000-0000-0000-0000-000000000000', 95, 'c2e6gxyf4qob', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 18:47:10.476012+00', '2026-06-28 18:47:10.476012+00', NULL, '4bae58e6-68d4-4df7-a4d9-5492412e90ba'),
	('00000000-0000-0000-0000-000000000000', 97, 'axhluvlrelhg', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 19:37:42.083567+00', '2026-06-28 19:37:42.083567+00', NULL, 'add84d51-db48-48a9-969f-9a3f900db2c3'),
	('00000000-0000-0000-0000-000000000000', 89, 'mlawsfhbcrdi', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 17:59:28.419772+00', '2026-06-28 19:47:16.19322+00', 'gav7pesrksdt', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 99, 'w3l5rtktored', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 19:48:26.631425+00', '2026-06-28 20:51:01.341595+00', NULL, '79ef96b8-08a4-4c93-9a16-4b782b8b458d'),
	('00000000-0000-0000-0000-000000000000', 101, 'vzmz5y6lnluk', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 21:18:39.731532+00', '2026-06-28 21:18:39.731532+00', 'rsqekj4qttog', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 107, '6eelitov7vnp', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 22:19:57.157301+00', '2026-06-28 22:19:57.157301+00', NULL, '1d30d941-e29b-4ae9-8193-4a5000d21e08'),
	('00000000-0000-0000-0000-000000000000', 103, 'vuxo3v5jzis7', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 21:31:42.063382+00', '2026-06-28 22:33:03.734115+00', NULL, '9403057a-1a62-4147-8178-f2c59809102e'),
	('00000000-0000-0000-0000-000000000000', 110, 'pyfsd7b5qhtw', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 22:41:05.659234+00', '2026-06-28 22:41:05.659234+00', 'qpjlcdrek36d', '79ef96b8-08a4-4c93-9a16-4b782b8b458d'),
	('00000000-0000-0000-0000-000000000000', 105, 'tlaxke3rgbo4', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 22:05:23.035305+00', '2026-06-28 23:03:55.689251+00', NULL, '31811128-7996-4bb8-9ba3-a4dea0e418ab'),
	('00000000-0000-0000-0000-000000000000', 112, 'pxbklghxbcni', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-29 19:36:54.176244+00', '2026-06-29 19:36:54.176244+00', 'rs6cnbzkyej5', '9403057a-1a62-4147-8178-f2c59809102e'),
	('00000000-0000-0000-0000-000000000000', 116, 'pa66ir5rfv3s', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', true, '2026-06-30 10:46:40.308566+00', '2026-06-30 11:57:26.700754+00', 'khqicgbrzj3z', 'c7ef1d5a-0eff-48d7-9ada-78d3abe8e359'),
	('00000000-0000-0000-0000-000000000000', 118, 'yy3qjnnx7r4q', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', false, '2026-06-30 13:04:00.931601+00', '2026-06-30 13:04:00.931601+00', 'vy7msicrrtpf', 'c7ef1d5a-0eff-48d7-9ada-78d3abe8e359'),
	('00000000-0000-0000-0000-000000000000', 114, 'ccftxpe7ebvl', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-30 09:25:33.774067+00', '2026-06-30 14:16:56.674038+00', NULL, 'e3309af2-ce92-4499-95a4-ac179cf4269c'),
	('00000000-0000-0000-0000-000000000000', 120, 'wchywjpw5vbd', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-30 17:28:16.335106+00', '2026-06-30 18:43:44.556256+00', 'ela26yrpoask', '31811128-7996-4bb8-9ba3-a4dea0e418ab'),
	('00000000-0000-0000-0000-000000000000', 122, 'r6bymvxxx6zb', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-30 19:09:24.928187+00', '2026-06-30 19:09:24.928187+00', NULL, 'b4e63477-5f32-4b29-bebd-f3cd39209bd9'),
	('00000000-0000-0000-0000-000000000000', 64, 'xmzwl64xd73k', '322258fe-e750-42fe-8fb0-6842986cb316', false, '2026-06-26 00:01:10.167839+00', '2026-06-26 00:01:10.167839+00', NULL, 'fc858a08-159d-4947-9385-ba15667c66b9'),
	('00000000-0000-0000-0000-000000000000', 66, 'm7snaejslqlb', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-26 00:18:25.138539+00', '2026-06-26 00:18:25.138539+00', NULL, '16ffe5da-c199-4e3d-9a5a-ad1b798aacce'),
	('00000000-0000-0000-0000-000000000000', 52, 'dju7rcltyqt2', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', true, '2026-06-25 20:11:46.369505+00', '2026-06-26 08:25:04.249344+00', NULL, 'af84fce4-2585-447a-aa18-cf7df84097f1'),
	('00000000-0000-0000-0000-000000000000', 68, 'bcxciapa3rc7', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 00:25:32.058234+00', '2026-06-26 10:50:48.623744+00', NULL, 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 70, '6cvs3ckdbneo', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 10:50:48.637867+00', '2026-06-26 12:08:38.301625+00', 'bcxciapa3rc7', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 72, '7dnlhhq6c3ov', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 13:20:16.834337+00', '2026-06-26 14:54:11.292851+00', 'r7isla52pljb', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 75, '54gocazqmxti', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 14:21:01.626561+00', '2026-06-26 15:19:47.045568+00', 'pgnpvopvk6jy', '08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542'),
	('00000000-0000-0000-0000-000000000000', 77, 'yvvprk6u5opz', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 15:19:47.054699+00', '2026-06-26 16:50:14.71792+00', '54gocazqmxti', '08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542'),
	('00000000-0000-0000-0000-000000000000', 81, 'yfvbedfsuvpg', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-26 16:54:44.953316+00', '2026-06-26 16:54:44.953316+00', 'wuoekgpnvq4a', '78740415-e5c2-4146-bb0b-6df421a094ca'),
	('00000000-0000-0000-0000-000000000000', 79, 'j5i5gsrvnpsa', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 16:00:55.926539+00', '2026-06-26 17:00:24.526063+00', 'cazhhrbrt3zg', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 82, 'engy4iy77llx', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 16:55:29.306281+00', '2026-06-26 18:09:25.80781+00', NULL, 'ac87d5a2-d7c0-434a-b4e1-1b383e401780'),
	('00000000-0000-0000-0000-000000000000', 84, 'pilwtij4earr', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-26 18:09:25.818281+00', '2026-06-28 11:00:35.398867+00', 'engy4iy77llx', 'ac87d5a2-d7c0-434a-b4e1-1b383e401780'),
	('00000000-0000-0000-0000-000000000000', 86, 'vaj7x6add64b', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 13:05:52.606513+00', '2026-06-28 18:10:25.042854+00', 'cqzivgx4pv5e', 'ac87d5a2-d7c0-434a-b4e1-1b383e401780'),
	('00000000-0000-0000-0000-000000000000', 88, 'vtabp7hscj25', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 17:22:13.152033+00', '2026-06-28 18:31:14.274435+00', '5so34lpemrrl', '08d3cbad-ad2f-4c9a-a8a0-36cbd2e9e542'),
	('00000000-0000-0000-0000-000000000000', 93, '3j2wtczr4lvy', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 18:32:42.823872+00', '2026-06-28 18:32:42.823872+00', NULL, 'fe3bfd32-1584-450a-9de8-ac2c6e9a9343'),
	('00000000-0000-0000-0000-000000000000', 96, 'vmjt7glxzslq', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 19:22:41.553265+00', '2026-06-28 19:22:41.553265+00', NULL, 'f0c39faa-e152-4209-8f44-5a08d0d6f69f'),
	('00000000-0000-0000-0000-000000000000', 98, 'rsqekj4qttog', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 19:47:16.199324+00', '2026-06-28 21:18:39.723428+00', 'mlawsfhbcrdi', 'fc014085-7f12-47ca-9f3b-b3b58945963c'),
	('00000000-0000-0000-0000-000000000000', 90, 'ctjgjjigu2pr', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 18:10:25.053038+00', '2026-06-28 21:19:47.041619+00', 'vaj7x6add64b', 'ac87d5a2-d7c0-434a-b4e1-1b383e401780'),
	('00000000-0000-0000-0000-000000000000', 104, 'hajkz6crbtq2', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 21:59:12.643328+00', '2026-06-28 21:59:12.643328+00', NULL, 'a3e9b7f6-6c82-4d12-a7f1-4e1359d546f7'),
	('00000000-0000-0000-0000-000000000000', 102, 'pp2ksqxhbv5p', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 21:19:47.046503+00', '2026-06-28 22:18:04.875399+00', 'ctjgjjigu2pr', 'ac87d5a2-d7c0-434a-b4e1-1b383e401780'),
	('00000000-0000-0000-0000-000000000000', 106, 'ulbfgkpfxab3', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 22:18:04.882917+00', '2026-06-28 22:18:04.882917+00', 'pp2ksqxhbv5p', 'ac87d5a2-d7c0-434a-b4e1-1b383e401780'),
	('00000000-0000-0000-0000-000000000000', 108, 'wsikrdt5rkim', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-28 22:32:40.586795+00', '2026-06-28 22:32:40.586795+00', NULL, 'd4f0e830-b370-49e7-9579-fab3de3fc88e'),
	('00000000-0000-0000-0000-000000000000', 100, 'qpjlcdrek36d', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 20:51:01.357031+00', '2026-06-28 22:41:05.649982+00', 'w3l5rtktored', '79ef96b8-08a4-4c93-9a16-4b782b8b458d'),
	('00000000-0000-0000-0000-000000000000', 109, 'rs6cnbzkyej5', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 22:33:03.739869+00', '2026-06-29 19:36:54.158535+00', 'vuxo3v5jzis7', '9403057a-1a62-4147-8178-f2c59809102e'),
	('00000000-0000-0000-0000-000000000000', 113, 'tnppnuuieqzo', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', true, '2026-06-30 08:49:51.66916+00', '2026-06-30 09:48:18.52187+00', NULL, 'c7ef1d5a-0eff-48d7-9ada-78d3abe8e359'),
	('00000000-0000-0000-0000-000000000000', 115, 'khqicgbrzj3z', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', true, '2026-06-30 09:48:18.534431+00', '2026-06-30 10:46:40.301295+00', 'tnppnuuieqzo', 'c7ef1d5a-0eff-48d7-9ada-78d3abe8e359'),
	('00000000-0000-0000-0000-000000000000', 117, 'vy7msicrrtpf', '32d9ef56-4a6d-4471-bfe3-ddf8d85eddf2', true, '2026-06-30 11:57:26.708562+00', '2026-06-30 13:04:00.92049+00', 'pa66ir5rfv3s', 'c7ef1d5a-0eff-48d7-9ada-78d3abe8e359'),
	('00000000-0000-0000-0000-000000000000', 119, 'anxv6qspxdna', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-30 14:16:56.687849+00', '2026-06-30 14:16:56.687849+00', 'ccftxpe7ebvl', 'e3309af2-ce92-4499-95a4-ac179cf4269c'),
	('00000000-0000-0000-0000-000000000000', 111, 'ela26yrpoask', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', true, '2026-06-28 23:03:55.702739+00', '2026-06-30 17:28:16.328396+00', 'tlaxke3rgbo4', '31811128-7996-4bb8-9ba3-a4dea0e418ab'),
	('00000000-0000-0000-0000-000000000000', 121, '4wmmokjndx7p', 'b980d0d7-b029-4cc6-b36c-776e26f02ccd', false, '2026-06-30 18:43:44.568703+00', '2026-06-30 18:43:44.568703+00', 'wchywjpw5vbd', '31811128-7996-4bb8-9ba3-a4dea0e418ab');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: empresas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."empresas" ("id", "nome_empresa", "nicho", "cidade", "endereco", "website_actual", "instagram", "facebook", "telefone_principal", "observacoes", "data_cadastro") VALUES
	('emp-1782285245933', 'Domus Dental', 'Clínica Dentária', 'Luanda', '', '', 'domus_dental_', 'domus_dental_', '932317225', '', '2026-06-24 07:14:05.933+00'),
	('emp-1782250635138', 'Dgeth Gráfica', 'Gráfica', 'Luanda', '', 'dgethgrafica.ao', '', '', '944974378', '', '2026-06-23 21:37:15.138+00'),
	('emp-1782248490529', 'JE ADVOGADOS', 'ADVOCACIA', 'Luanda', 'Maianga, Luanda, Angola', '', '', '', '949970895', '', '2026-06-23 21:01:30.529+00'),
	('emp-1782236137304', 'Geratec', 'Industrial', 'Luanda', 'Urbanização nova vida, luanda, Angola', 'geratec.ao', 'geratec_solucoes_energeticas', '', '931000993', '', '2026-06-23 17:35:37.304+00'),
	('emp-1782235222321', 'Mulato Business', 'coworking', 'Luanda', 'Kilamba, Q14', 'coworking.mulatobusiness.com', 'coworking.mb', '', '924006984', '', '2026-06-23 17:20:22.321+00');


--
-- Data for Name: contactos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contactos" ("id", "empresa_id", "nome", "cargo", "telefone", "whatsapp", "email", "observacoes") VALUES
	('con-1782331196813', 'emp-1782285245933', 'Gervásio da Rosa', 'CEO', '932317225', '', '', ''),
	('con-1782250635138-0', 'emp-1782250635138', 'David Marcos', '', '936179738', '', 'david@gmail.com', ''),
	('con-1782250635138-1', 'emp-1782250635138', 'Catarina', 'CEO', '944974378', '944974378', 'catarina@gmail.com', ''),
	('con-1782248490529-0', 'emp-1782248490529', 'João Epalanga', 'Director', '949970895', '949970895', 'joaosegundaepalangae@gmail.com', 'Prefere ligação no whatsaap'),
	('con-1782236205381', 'emp-1782236137304', 'Helga Jossany', 'Directora de RH', '948785240', '948785240', 'geral@geratec.ao', ''),
	('con-1782236137304-0', 'emp-1782236137304', 'Filomeno Miranda', 'Director', '931000993', '931000993', 'direccao@geratec.ao', ''),
	('con-1782235222321-0', 'emp-1782235222321', 'Joaquim Mulato', 'CEO', '939036264', '939036264', 'geral@mulatobusiness.com', '');


--
-- Data for Name: documentos_cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."documentos_cliente" ("id", "nome_empresa", "servico_contratado", "tipo", "nome_ficheiro", "url_ficheiro", "data_upload") VALUES
	('pasta-oport-1782418061385', 'Mulato Business', 'Email Corporativo', '__pasta__', '', '', '2026-06-25 20:07:41.385+00'),
	('pasta-oport-1782407939145', 'Geratec', 'Email Corporativo', '__pasta__', '', '', '2026-06-25 17:18:59.145+00'),
	('pasta-oport-1782407100128', 'Dgeth Gráfica', 'Website', '__pasta__', '', '', '2026-06-25 17:05:00.128+00'),
	('pasta-oport-1782406929930', 'JE ADVOGADOS', 'Branding', '__pasta__', '', '', '2026-06-25 17:02:09.93+00'),
	('pasta-oport-1782406524290', 'Geratec', 'Website', '__pasta__', '', '', '2026-06-25 16:55:24.29+00'),
	('pasta-oport-1782406142592', 'Mulato Business', 'Website', '__pasta__', '', '', '2026-06-25 16:49:02.592+00'),
	('doc-1782490317855', 'Dgeth Gráfica', 'Website', 'Contrato', 'Contrato', 'https://drive.google.com/file/d/1boBfj2DPh0sY26UJNAHfFa6mgfEy6Tc-/view?usp=drive_link', '2026-06-26 16:11:57.855+00'),
	('doc-1782490299758', 'Dgeth Gráfica', 'Website', 'Factura Genérica', 'Factura', 'https://drive.google.com/file/d/1PnuGX_hPhXNMDVXU8zDcMxHzyl8T24rm/view?usp=drive_link', '2026-06-26 16:11:39.758+00'),
	('doc-1782490217199', 'Geratec', 'Email Corporativo', 'Factura Recibo', 'Recibo', 'https://drive.google.com/file/d/1V4WMl4i6QjGCcYBTm5HArzHWvMZJYJ13/view?usp=drive_link', '2026-06-26 16:10:17.199+00'),
	('doc-1782490131496', 'Geratec', 'Website', 'Factura Recibo', 'Recibo 2', 'https://drive.google.com/file/d/1Du1mMlLBvEYHhjfXNEu07sznJ85keIyl/view?usp=drive_link', '2026-06-26 16:08:51.496+00'),
	('doc-1782490108847', 'Geratec', 'Website', 'Factura Recibo', 'recibo 1', 'https://drive.google.com/file/d/15NZ9MylJxyvxYIQP_hH1HjQeXahqNu8-/view?usp=drive_link', '2026-06-26 16:08:28.847+00'),
	('doc-1782490004521', 'Geratec', 'Website', 'Factura Genérica', 'Factura', 'https://drive.google.com/file/d/1T_9e7Ur8DMjDwwgzcX83NSd9xMPuOMzY/view?usp=drive_link', '2026-06-26 16:06:44.521+00'),
	('doc-1782489947025', 'Geratec', 'Website', 'Termo de Entrega', 'TERMO', 'https://drive.google.com/file/d/1z35XUcoTxtaBxs2nQ1Tpe8utFKqHClLt/view?usp=drive_link', '2026-06-26 16:05:47.025+00'),
	('doc-1782489878832', 'Mulato Business', 'Email Corporativo', 'Factura Recibo', 'Recibo', 'https://drive.google.com/file/d/1gxROYeolqrZVJihd6_kSFzBfhxmCg5xF/view?usp=drive_link', '2026-06-26 16:04:38.832+00'),
	('doc-1782489805026', 'Mulato Business', 'Website', 'Factura Genérica', 'Factura', 'https://drive.google.com/file/d/1DmMo7B3AtJXFYWzYUJYRIfz4WiS9PjaC/view?usp=drive_link', '2026-06-26 16:03:25.026+00'),
	('doc-1782489774378', 'Mulato Business', 'Website', 'Termo de Entrega', 'Termo', 'https://drive.google.com/file/d/12oS3tUOvpmD3igWPoWuKMofPcNPG_oCt/view?usp=drive_link', '2026-06-26 16:02:54.378+00'),
	('doc-1782488809399', 'Mulato Business', 'Website', 'Factura Recibo', 'RECIBO', 'https://drive.google.com/file/d/1hDay4mr5lSo7TS4uTCvfdHT9zlG23DdP/view?usp=drive_link', '2026-06-26 15:46:49.399+00');


--
-- Data for Name: historico; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."historico" ("id", "empresa_id", "autor", "data", "tipo", "descricao") VALUES
	('hist-1782688252079', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 23:10:52.079+00', 'etapa_mudança', 'Alterou etapa de ''Lead Captado'' para ''Primeiro Contacto'''),
	('hist-1782686078695', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:34:38.695+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Lead Captado'''),
	('hist-1782680703142', 'emp-1782250635138', 'Edgar Kassocota', '2026-06-28 21:05:03.142+00', 'etapa_mudança', 'Alterou etapa de ''Negociação'' para ''Fechado'''),
	('hist-1782680690992', 'emp-1782250635138', 'Edgar Kassocota', '2026-06-28 21:04:50.992+00', 'etapa_mudança', 'Alterou etapa de ''Fechado'' para ''Negociação'''),
	('hist-1782680662127', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 21:04:22.127+00', 'etapa_mudança', 'Alterou etapa de ''Lead Captado'' para ''Primeiro Contacto'''),
	('hist-1782680255526', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 20:57:35.526+00', 'etapa_mudança', 'Alterou etapa de ''Lead Captado'' para ''Primeiro Contacto'''),
	('hist-1782492649585', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-26 16:50:49.585+00', 'nota', 'Editou as informações principais da empresa.'),
	('hist-1782486657744', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-26 15:10:57.744+00', 'oportunidade', 'Identificou oportunidade de ''Social Media'' avaliada em 65 000 Kz'),
	('hist-1782483305608', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-26 14:15:05.608+00', 'etapa_mudança', 'Alterou etapa de ''Negociação'' para ''Fechado'''),
	('hist-1782426458862', 'emp-1782236137304', 'Edgar Kassocota', '2026-06-25 22:27:38.862+00', 'etapa_mudança', 'Alterou etapa de ''Negociação'' para ''Fechado'''),
	('hist-1782426437005', 'emp-1782236137304', 'Edgar Kassocota', '2026-06-25 22:27:17.005+00', 'etapa_mudança', 'Alterou etapa de ''Fechado'' para ''Negociação'''),
	('hist-1782423259872', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-25 21:34:19.872+00', 'etapa_mudança', 'Alterou etapa de ''Reunião Agendada'' para ''Primeiro Contacto'''),
	('hist-1782421857463', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-25 21:10:57.463+00', 'etapa_mudança', 'Alterou etapa de ''Fechado'' para ''Negociação'''),
	('hist-1782406142592', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-25 16:49:02.592+00', 'oportunidade', 'Identificou oportunidade de ''Website'' avaliada em 350 000 Kz'),
	('hist-1782334556737', 'emp-1782236137304', 'Edgar Kassocota', '2026-06-24 20:55:56.737+00', 'projeto', 'Actualizou estado do projecto de ''Em Produção'' para ''Pronto para Entrega'''),
	('hist-1782329968353', 'emp-1782250635138', 'Edgar Kassocota', '2026-06-24 19:39:28.353+00', 'projeto', 'Actualizou estado do projecto de ''Cliente Activo'' para ''Pronto para Entrega'''),
	('hist-1782285245934', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-24 07:14:05.934+00', 'cadastro', 'Adicionou nova empresa ''Domus Dental'' no diretório.'),
	('hist-1782251836411', 'emp-1782236137304', 'Edgar Kassocota', '2026-06-23 21:57:16.411+00', 'oportunidade', 'Identificou oportunidade de ''Email Corporativo'' avaliada em 30 000 Kz'),
	('hist-1782250675813', 'emp-1782250635138', 'Edgar Kassocota', '2026-06-23 21:37:55.813+00', 'oportunidade', 'Identificou oportunidade de ''Website'' avaliada em 350 000 Kz'),
	('hist-1782250635138-contacts', 'emp-1782250635138', 'Edgar Kassocota', '2026-06-23 21:37:15.138+00', 'contacto', 'Adicionou 2 contacto(s) inicial(ais) junto ao cadastro da empresa.'),
	('hist-1782250635138', 'emp-1782250635138', 'Edgar Kassocota', '2026-06-23 21:37:15.138+00', 'cadastro', 'Adicionou nova empresa ''Dgeth Gráfica'' no diretório.'),
	('hist-1782248490529-contacts', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-23 21:01:30.529+00', 'contacto', 'Adicionou 1 contacto(s) inicial(ais) junto ao cadastro da empresa.'),
	('hist-1782235295597', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-23 17:21:35.597+00', 'oportunidade', 'Identificou oportunidade de ''Website'' avaliada em 350 000 Kz'),
	('hist-1782235222321', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-23 17:20:22.321+00', 'cadastro', 'Adicionou nova empresa ''Mulato Business'' no diretório.'),
	('hist-1782248490529', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-23 21:01:30.529+00', 'cadastro', 'Adicionou nova empresa ''JE ADVOGADOS'' no diretório.'),
	('hist-1782235222321-contacts', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-23 17:20:22.321+00', 'contacto', 'Adicionou 1 contacto(s) inicial(ais) junto ao cadastro da empresa.'),
	('hist-1782680275694', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 20:57:55.694+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Lead Captado'''),
	('hist-1782488051369', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-26 15:34:11.369+00', 'oportunidade', 'Identificou oportunidade de ''Social Media'' avaliada em 1 200 000 Kz'),
	('hist-1782486740195', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-26 15:12:20.195+00', 'oportunidade', 'Identificou oportunidade de ''Social Media'' avaliada em 1 200 000 Kz'),
	('hist-1782486605336', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-26 15:10:05.336+00', 'etapa_mudança', 'Alterou etapa de ''Negociação'' para ''Fechado'''),
	('hist-1782486600425', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-26 15:10:00.425+00', 'etapa_mudança', 'Alterou etapa de ''Fechado'' para ''Negociação'''),
	('hist-1782483300764', 'emp-1782235222321', 'Edgar Kassocota', '2026-06-26 14:15:00.764+00', 'etapa_mudança', 'Alterou etapa de ''Fechado'' para ''Negociação'''),
	('hist-1782423316387', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-25 21:35:16.387+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Reunião Agendada'' - [REUNIÃO AGENDADA] Dia 01/07/2026 às 15:30'),
	('hist-1782330958848', 'emp-1782236137304', 'Edgar Kassocota', '2026-06-24 19:55:58.848+00', 'etapa_mudança', 'Alterou etapa de ''Negociação'' para ''Fechado'''),
	('hist-1782330957026', 'emp-1782236137304', 'Edgar Kassocota', '2026-06-24 19:55:57.026+00', 'etapa_mudança', 'Alterou etapa de ''Fechado'' para ''Negociação'''),
	('hist-1782285326946', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-24 07:15:26.946+00', 'oportunidade', 'Identificou oportunidade de ''Website'' avaliada em 350 000 Kz'),
	('hist-1782248878394', 'emp-1782248490529', 'Severino Madureira', '2026-06-23 21:07:58.394+00', 'etapa_mudança', 'Alterou etapa de ''Reunião Agendada'' para ''Reunião Realizada'''),
	('hist-1782248877522', 'emp-1782248490529', 'Severino Madureira', '2026-06-23 21:07:57.522+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Reunião Agendada'''),
	('hist-1782248876347', 'emp-1782248490529', 'Severino Madureira', '2026-06-23 21:07:56.347+00', 'etapa_mudança', 'Alterou etapa de ''Lead Captado'' para ''Primeiro Contacto'''),
	('hist-1782248834038', 'emp-1782248490529', 'Edgar Kassocota', '2026-06-23 21:07:14.038+00', 'oportunidade', 'Identificou oportunidade de ''Branding'' avaliada em 249 000 Kz'),
	('hist-1782688265967', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 23:11:05.967+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Lead Captado'''),
	('hist-1782686528621', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:42:08.621+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Lead Captado'''),
	('hist-1782686479805', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:41:19.805+00', 'etapa_mudança', 'Alterou etapa de ''Lead Captado'' para ''Primeiro Contacto'''),
	('hist-1782686425885', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:40:25.885+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Lead Captado'''),
	('hist-1782686383549', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:39:43.549+00', 'etapa_mudança', 'Alterou etapa de ''Lead Captado'' para ''Primeiro Contacto'''),
	('hist-1782686309565', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:38:29.565+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Lead Captado'''),
	('hist-1782686226022', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:37:06.022+00', 'etapa_mudança', 'Alterou etapa de ''Lead Captado'' para ''Primeiro Contacto'''),
	('hist-1782686206133', 'emp-1782285245933', 'Edgar Kassocota', '2026-06-28 22:36:46.133+00', 'etapa_mudança', 'Alterou etapa de ''Primeiro Contacto'' para ''Lead Captado''');


--
-- Data for Name: oportunidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."oportunidades" ("id", "empresa_id", "servico", "valor_estimado", "responsavel", "data_entrada", "observacoes", "etapa", "motivo_perda", "motivo_perda_detalhe", "origem") VALUES
	('oport-1782418061385', 'emp-1782235222321', 'Email Corporativo', 5292, 'Edgar Kassocota', '2026-06-25 20:07:41.385+00', '', 'Fechado', NULL, NULL, 'Outro'),
	('oport-1782408910414', 'emp-1782285245933', 'Website', 350000, 'Edgar Kassocota', '2026-06-25 17:35:10.414+00', 'CEO identificado no linkedin', 'Lead Captado', NULL, NULL, 'LinkedIn'),
	('oport-1782407939145', 'emp-1782236137304', 'Email Corporativo', 30000, 'Edgar Kassocota', '2026-06-25 17:18:59.145+00', '', 'Fechado', NULL, NULL, 'Ligação fria'),
	('oport-1782407100128', 'emp-1782250635138', 'Website', 350000, 'Severino Madureira', '2026-06-25 17:05:00.128+00', '', 'Fechado', NULL, NULL, 'Instagram'),
	('oport-1782406142592', 'emp-1782235222321', 'Website', 350000, 'Edgar Kassocota', '2026-06-25 16:49:02.592+00', '', 'Fechado', NULL, NULL, 'Instagram'),
	('oport-1782408809304', 'emp-1782248490529', 'Website', 350000, 'Edgar Kassocota', '2026-06-25 17:33:29.304+00', '[REUNIÃO AGENDADA] Dia 01/07/2026 às 15:30', 'Reunião Agendada', NULL, NULL, 'Outro'),
	('oport-1782406929930', 'emp-1782248490529', 'Branding', 249000, 'Edgar Kassocota', '2026-06-25 17:02:09.93+00', 'Produção completa do manual da marca no pacote start', 'Fechado', NULL, NULL, 'Indicação'),
	('oport-1782406524290', 'emp-1782236137304', 'Website', 350000, 'Edgar Kassocota', '2026-06-25 16:55:24.29+00', '', 'Fechado', NULL, NULL, 'Instagram');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "nome", "perfil", "data_cadastro", "permissoes") VALUES
	('989f27e8-4724-43cf-bc54-bb102c12fd86', 'severinomadureira@vendaia.site', 'Severino Madureira', 'Comercial', NULL, 'dashboard,empresas,pipeline,projectos,utilizadores,configuracoes'),
	('b980d0d7-b029-4cc6-b36c-776e26f02ccd', 'edkassocota@vendaia.site', 'Edgar Kassocota', 'Operacional', '2026-06-23 16:09:01.791267+00', 'dashboard,empresas,pipeline,projectos,utilizadores,configuracoes');


--
-- Data for Name: projectos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projectos" ("id", "empresa_id", "servico", "valor", "data_inicio", "prazo", "responsavel", "estado", "observacoes", "oportunidade_id") VALUES
	('proj-1782422629333', 'emp-1782250635138', 'Website', 350000, '2026-06-25 21:23:49.333+00', '2026-06-25', 'Severino Madureira', 'Pronto para Entrega', 'Faturado. Transmitido automaticamente para a equipa técnica.', 'oport-1782407100128'),
	('proj-1782422633277', 'emp-1782236137304', 'Website', 350000, '2026-06-25 21:23:53.277+00', '2026-07-25', 'Edgar Kassocota', 'Entregue', 'Faturado. Transmitido automaticamente para a equipa técnica.
[ENTREGUE em 28/03/2026]', 'oport-1782406524290'),
	('proj-1782421861767', 'emp-1782235222321', 'Email Corporativo', 5292, '2026-06-25 21:11:01.767+00', '2026-06-25', 'Edgar Kassocota', 'Entregue', 'Faturado. Transmitido automaticamente para a equipa técnica.
[ENTREGUE em 21/03/2026]', 'oport-1782418061385'),
	('proj-1782422635525', 'emp-1782235222321', 'Website', 350000, '2026-06-25 21:23:55.525+00', '2026-07-25', 'Edgar Kassocota', 'Entregue', 'Faturado. Transmitido automaticamente para a equipa técnica.
[ENTREGUE em 21/03/2026]', 'oport-1782406142592'),
	('proj-1782422631429', 'emp-1782248490529', 'Branding', 249000, '2026-06-25 21:23:51.429+00', '2026-07-25', 'Edgar Kassocota', 'Entregue', 'Produção completa do manual da marca no pacote start
[ENTREGUE em 16/06/2026]', 'oport-1782406929930'),
	('proj-1782422589838', 'emp-1782236137304', 'Email Corporativo', 30000, '2026-06-25 21:23:09.838+00', '2026-07-25', 'Edgar Kassocota', 'Entregue', 'Faturado. Transmitido automaticamente para a equipa técnica.
[APRESENTAÇÃO AGENDADA] 10/04/2026 às 12:30 — Whatsapp
[ENTREGUE em 10/04/2026]', 'oport-1782407939145');


--
-- Data for Name: tarefas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tarefas" ("id", "titulo", "descricao", "responsavel", "data", "prioridade", "estado", "empresa_id", "oportunidade_id", "data_criacao") VALUES
	('d4dcde54-7d93-4c8e-965e-d731d8299c90', 'notificações no crm', '', 'Edgar Kassocota', '2026-06-28 00:00:00+00', 'Alta', 'Pendente', NULL, NULL, '2026-06-28 20:29:36.320713+00'),
	('8c54726c-0971-4fe3-9ffa-678296b041fd', 'Ligar para a gelinho projectart', '', 'Severino Madureira', '2026-06-28 00:00:00+00', 'Alta', 'Pendente', NULL, NULL, '2026-06-28 20:51:27.163675+00'),
	('c6defbb7-7a63-45f1-8e19-6eb4054b7403', 'Deixar mensagem para o CEO da Domus Dental!', 'Perfil do linkedin', 'Edgar Kassocota', '2026-06-28 00:00:00+00', 'Alta', 'Pendente', NULL, NULL, '2026-06-28 22:15:10.366137+00'),
	('252685f9-e25a-436f-bfa8-d64809b8ecd5', 'Confirmar a data de apresentação com a Dgeth', '', 'Severino Madureira', '2026-06-29 00:00:00+00', 'Alta', 'Pendente', 'emp-1782250635138', 'oport-1782407100128', '2026-06-28 17:45:17.093739+00');


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 122, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict YRSTDGrUSHeWzmLcXy7X8WmXtrwL6dWg6Sbt560Ib6Z6hPC2E0R4dVIbG07KTPj

RESET ALL;
