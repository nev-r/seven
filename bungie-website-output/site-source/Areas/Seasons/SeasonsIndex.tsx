// Created by jlauer, 2020
// Copyright Bungie, Inc.

import {
  SeasonDefinition,
  SeasonsArray,
  SeasonsDefinitions,
} from "@Areas/Seasons/SeasonsDefinitions";
import { Localizer } from "@Global/Localization/Localizer";
import { Anchor } from "@UI/Navigation/Anchor";
import { TwoLineItem } from "@UIKit/Companion/TwoLineItem";
import { Grid, GridCol } from "@UIKit/Layout/Grid/Grid";
import { BasicSize } from "@UIKit/UIKitUtils";
import classNames from "classnames";
import React from "react";
import styles from "./SeasonsIndex.module.scss";

interface SeasonsIndexProps {}

export const SeasonsIndex: React.FC<SeasonsIndexProps> = (props) => {
  const pastSeasons = SeasonsArray.filter(
    (s) => s !== SeasonsDefinitions.currentSeason
  );
  const currentSeason = SeasonsDefinitions.currentSeason;

  return (
    <Grid className={styles.grid}>
      <GridCol cols={12}>
        <h2 className={styles.sectionHeader}>
          {Localizer.Seasons.CurrentSeason}
        </h2>
      </GridCol>

      <Anchor url={currentSeason.productPageLink}>
        <GridCol
          cols={12}
          className={classNames(styles.cardWrapper, styles.currentSeason)}
        >
          <SeasonCard season={currentSeason} isCurrent={true} />
        </GridCol>
      </Anchor>

      <GridCol cols={12}>
        <h3 className={styles.sectionHeader}>
          {Localizer.Seasons.PastSeasons}
        </h3>
      </GridCol>

      {pastSeasons.map((season, i) => (
        <Anchor url={season.productPageLink} key={i}>
          <GridCol cols={6} mobile={12} className={styles.cardWrapper}>
            <SeasonCard season={season} />
          </GridCol>
        </Anchor>
      ))}
    </Grid>
  );
};

interface SeasonCardProps {
  season: SeasonDefinition;
  isCurrent?: boolean;
}

const SeasonCard: React.FC<SeasonCardProps> = ({ season, isCurrent }) => {
  const title = isCurrent ? (
    <h1 className={styles.title}>{season.title}</h1>
  ) : (
    <span className={styles.title}>{season.title}</span>
  );

  return (
    <>
      <div className={styles.card}>
        <div
          className={styles.cardImage}
          style={{
            backgroundImage: `url(${season.image})`,
          }}
        />
      </div>
      <div className={styles.details}>
        <TwoLineItem
          itemTitle={title}
          itemSubtitle={Localizer.Format(Localizer.Seasons.SeasonSeasonnumber, {
            seasonNumber: season.seasonNumber,
          })}
          size={BasicSize.Large}
        />
      </div>
    </>
  );
};
