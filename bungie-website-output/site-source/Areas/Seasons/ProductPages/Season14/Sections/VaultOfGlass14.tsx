// Created by a-bphillips, 2021
// Copyright Bungie, Inc.

import LazyLoadWrapper from "@Areas/Seasons/ProductPages/Season14/Components/LazyLoadWrapper";
import { SectionHeader } from "@Areas/Seasons/ProductPages/Season14/Components/SectionHeader";
import { Responsive } from "@Boot/Responsive";
import { useDataStore } from "@bungie/datastore/DataStoreHooks";
import { Localizer } from "@bungie/localization";
import { sanitizeHTML } from "@UI/Content/SafelySetInnerHTML";
import { SystemNames } from "@Global/SystemNames";
import { Platform } from "@Platform";
import { Button } from "@UIKit/Controls/Button/Button";
import { Icon } from "@UIKit/Controls/Icon";
import YoutubeModal from "@UIKit/Controls/Modal/YoutubeModal";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import { LocalizerUtils } from "@Utilities/LocalizerUtils";
import classNames from "classnames";
import moment from "moment";
import React, { LegacyRef, useEffect, useState } from "react";
import styles from "./VaultOfGlass14.module.scss";

interface VaultOfGlass14Props {
  inputRef: LegacyRef<HTMLDivElement>;
}

interface ICalloutText {
  CalloutHeading?: string;
  CalloutBlurb?: string;
  CalloutDisclaimer?: string;
  CalloutBtnTextAvailable?: string;
  CalloutBtnTextUnavailable?: string;
}

const fetchCalloutText = async () => {
  try {
    const sc = await Platform.ContentService.GetContentByTagAndType(
      "season-14-silver-bundles",
      "StringCollection",
      Localizer.CurrentCultureName,
      false
    );

    const data: ICalloutText = LocalizerUtils.stringCollectionToObject(sc);

    return data;
  } catch (err) {
    return null;
  }
};

const fetchBgImages = async () => {
  try {
    const images = await Platform.ContentService.GetContentByTagAndType(
      "season-14-emote-bundle",
      "MarketingMediaAsset",
      Localizer.CurrentCultureName,
      false
    );

    return images.properties;
  } catch (err) {
    return null;
  }
};

const trailerJsonParamToLocalizedValue = (paramName: string): string | null => {
  const trailerString = ConfigUtils.GetParameter(
    SystemNames.Season14Page,
    paramName,
    "{}"
  ).replace(/'/g, '"');
  const trailerData = JSON.parse(trailerString);

  return trailerData[Localizer.CurrentCultureName] ?? trailerData["en"] ?? null;
};

const VaultOfGlass14: React.FC<VaultOfGlass14Props> = (props) => {
  const responsive = useDataStore(Responsive);

  const s14 = Localizer.Season14;

  const [emoteBlockText, setEmoteBlockText] = useState<null | ICalloutText>(
    null
  );
  const [bgImages, setBgImages] = useState(null);

  const emoteBtnAnalyticsId = ConfigUtils.GetParameter(
    SystemNames.Season14Page,
    "Season14EmoteBundleAnalyticsId",
    ""
  );
  const trailerBtnAnalyticsId = ConfigUtils.GetParameter(
    SystemNames.Season14Page,
    "Season14RaidTrailerAnalyticsId",
    ""
  );
  const raidTrailerId = trailerJsonParamToLocalizedValue(
    "Season14RaidTrailerId"
  );

  useEffect(() => {
    // fetch emote block text from firehose
    fetchCalloutText().then((response) => {
      setEmoteBlockText(response);
    });
    // get desktop and mobile bg images
    fetchBgImages().then((response) => {
      setBgImages({
        desktopBg: response?.LargeImage,
        mobileBg: response?.ImageThumbnail,
      });
    });
  }, []);

  // check if bundle button should be disabled
  const isBundleBtnActiveParam: string = ConfigUtils.GetParameter(
    SystemNames.Season14PageUpdate,
    "UpdateSilverBundleBtn",
    "false"
  );
  const isBundleBtnActive = isBundleBtnActiveParam === "true";

  const bundleBtnText = isBundleBtnActive
    ? emoteBlockText?.CalloutBtnTextAvailable
    : emoteBlockText?.CalloutBtnTextUnavailable;

  // get bg image for section based on screen size
  const bgImage =
    bgImages &&
    (responsive.mobile
      ? `url(${bgImages?.mobileBg})`
      : `url(${bgImages?.desktopBg})`);

  return (
    <div className={styles.raidSection}>
      <div
        className={classNames(styles.sectionIdAnchor, styles.raidSectionAnchor)}
        id={"raid"}
        ref={props.inputRef}
      />
      <div className={styles.sectionBg}>
        <div className={styles.sectionBorder} />
      </div>
      <div className={classNames(styles.contentWrapperNormal)}>
        <LazyLoadWrapper>
          <p className={styles.smallHeading}>{s14.VOGSmallHeading}</p>
          <SectionHeader
            title={s14.VOGHeading}
            seasonText={s14.SectionHeaderSeasonText}
            sectionName={s14.RaidSectionName}
            className={styles.sectionHeader}
            isBold={true}
          />
          <p className={classNames(styles.paragraphLarge, styles.blurbHeading)}>
            {s14.VOGBlurbHeading}
          </p>
          <div className={styles.flexContentWrapper}>
            <div className={styles.textContent}>
              <p className={classNames(styles.paragraphLarge)}>
                {s14.VOGBlurb}
              </p>
            </div>
            <div className={styles.trailerWrapper}>
              <div
                className={styles.trailerBtn}
                onClick={() => YoutubeModal.show({ videoId: raidTrailerId })}
                data-analytics-id={trailerBtnAnalyticsId}
              >
                <div className={styles.trailerBg} />
                <div className={styles.iconWrapper}>
                  <Icon
                    className={styles.playIcon}
                    iconType={"material"}
                    iconName={"play_arrow"}
                  />
                </div>
              </div>
              <p>{s14.VogRaidTrailerTitle}</p>
            </div>
          </div>
        </LazyLoadWrapper>
      </div>
      <div className={styles.contentWrapperLarge}>
        <div
          className={classNames(styles.emoteBundleBlock)}
          style={{ backgroundImage: bgImage }}
        >
          {!emoteBlockText && (
            <video muted={true} autoPlay={true} playsInline={true} loop={true}>
              <source
                src={"/7/ca/destiny/bgs/season14/s14_vog_coming_soon_web.mp4"}
                type={"video/mp4"}
              />
            </video>
          )}

          {emoteBlockText && (
            <div className={styles.contentWrapper}>
              <h4
                dangerouslySetInnerHTML={sanitizeHTML(
                  emoteBlockText?.CalloutHeading
                )}
              />
              <p className={classNames(styles.paragraph, styles.emoteBlurb)}>
                {emoteBlockText?.CalloutBlurb}
              </p>
              <p className={styles.emoteDisclaimer}>
                {emoteBlockText?.CalloutDisclaimer}
              </p>
              <Button
                buttonType={"blue"}
                className={styles.emoteBtn}
                size={2}
                analyticsId={emoteBtnAnalyticsId}
                url={"/silverbundle-atheon"}
                disabled={!isBundleBtnActive}
              >
                {bundleBtnText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultOfGlass14;
