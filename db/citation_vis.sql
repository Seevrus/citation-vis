-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2022. Jan 15. 07:58
-- Kiszolgáló verziója: 10.4.20-MariaDB
-- PHP verzió: 7.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `citation_vis`
--
CREATE DATABASE IF NOT EXISTS `citation_vis` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `citation_vis`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `article`
--

DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `doi` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `scopus_id` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `sgr` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `title` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `abstract` mediumtext COLLATE utf8_hungarian_ci DEFAULT NULL,
  `itsyear` year(4) DEFAULT NULL,
  `journal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `volume` varchar(10) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `issue` varchar(10) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `page_start` int(10) UNSIGNED DEFAULT NULL,
  `page_end` int(10) UNSIGNED DEFAULT NULL,
  `citations` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `author`
--

DROP TABLE IF EXISTS `author`;
CREATE TABLE `author` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `author_id` varchar(250) COLLATE utf8_hungarian_ci NOT NULL,
  `author_given_name` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `author_surname` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `citations` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `conn_article_author`
--

DROP TABLE IF EXISTS `conn_article_author`;
CREATE TABLE `conn_article_author` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `author_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `conn_article_subject`
--

DROP TABLE IF EXISTS `conn_article_subject`;
CREATE TABLE `conn_article_subject` (
  `id` bigint(20) NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `conn_author_university`
--

DROP TABLE IF EXISTS `conn_author_university`;
CREATE TABLE `conn_author_university` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `author_id` bigint(20) UNSIGNED NOT NULL,
  `university_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `conn_citing_cited`
--

DROP TABLE IF EXISTS `conn_citing_cited`;
CREATE TABLE `conn_citing_cited` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `citing_id` bigint(20) UNSIGNED NOT NULL,
  `cited_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `csubject`
--

DROP TABLE IF EXISTS `csubject`;
CREATE TABLE `csubject` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` int(11) UNSIGNED NOT NULL,
  `csubject` varchar(250) COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `journal`
--

DROP TABLE IF EXISTS `journal`;
CREATE TABLE `journal` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) COLLATE utf8_hungarian_ci NOT NULL,
  `publisher` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `university`
--

DROP TABLE IF EXISTS `university`;
CREATE TABLE `university` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `u_name` varchar(1000) COLLATE utf8_hungarian_ci NOT NULL,
  `country` varchar(250) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `city` varchar(1000) COLLATE utf8_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `article`
--
ALTER TABLE `article`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `doi` (`doi`),
  ADD UNIQUE KEY `scopus_id` (`scopus_id`),
  ADD UNIQUE KEY `sgr` (`sgr`),
  ADD KEY `journal_id` (`journal_id`);

--
-- A tábla indexei `author`
--
ALTER TABLE `author`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `scopus_id` (`author_id`);

--
-- A tábla indexei `conn_article_author`
--
ALTER TABLE `conn_article_author`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `article_id` (`article_id`);

--
-- A tábla indexei `conn_article_subject`
--
ALTER TABLE `conn_article_subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `article_id` (`article_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- A tábla indexei `conn_author_university`
--
ALTER TABLE `conn_author_university`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `university_id` (`university_id`);

--
-- A tábla indexei `conn_citing_cited`
--
ALTER TABLE `conn_citing_cited`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cited_id` (`cited_id`),
  ADD KEY `citing_id` (`citing_id`);

--
-- A tábla indexei `csubject`
--
ALTER TABLE `csubject`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- A tábla indexei `journal`
--
ALTER TABLE `journal`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title` (`title`);

--
-- A tábla indexei `university`
--
ALTER TABLE `university`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`u_name`) USING BTREE;

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `article`
--
ALTER TABLE `article`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `author`
--
ALTER TABLE `author`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `conn_article_author`
--
ALTER TABLE `conn_article_author`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `conn_article_subject`
--
ALTER TABLE `conn_article_subject`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `conn_author_university`
--
ALTER TABLE `conn_author_university`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `conn_citing_cited`
--
ALTER TABLE `conn_citing_cited`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `csubject`
--
ALTER TABLE `csubject`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `journal`
--
ALTER TABLE `journal`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `university`
--
ALTER TABLE `university`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `article`
--
ALTER TABLE `article`
  ADD CONSTRAINT `article_ibfk_1` FOREIGN KEY (`journal_id`) REFERENCES `journal` (`id`);

--
-- Megkötések a táblához `conn_article_author`
--
ALTER TABLE `conn_article_author`
  ADD CONSTRAINT `conn_article_author_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `author` (`id`),
  ADD CONSTRAINT `conn_article_author_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`);

--
-- Megkötések a táblához `conn_article_subject`
--
ALTER TABLE `conn_article_subject`
  ADD CONSTRAINT `conn_article_subject_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`),
  ADD CONSTRAINT `conn_article_subject_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `csubject` (`id`);

--
-- Megkötések a táblához `conn_author_university`
--
ALTER TABLE `conn_author_university`
  ADD CONSTRAINT `conn_author_university_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `author` (`id`),
  ADD CONSTRAINT `conn_author_university_ibfk_2` FOREIGN KEY (`university_id`) REFERENCES `university` (`id`);

--
-- Megkötések a táblához `conn_citing_cited`
--
ALTER TABLE `conn_citing_cited`
  ADD CONSTRAINT `conn_citing_cited_ibfk_1` FOREIGN KEY (`cited_id`) REFERENCES `article` (`id`),
  ADD CONSTRAINT `conn_citing_cited_ibfk_2` FOREIGN KEY (`citing_id`) REFERENCES `article` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
