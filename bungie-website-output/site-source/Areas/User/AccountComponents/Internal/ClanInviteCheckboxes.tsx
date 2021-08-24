// Created by larobinson, 2021
// Copyright Bungie, Inc.

import { ConvertToPlatformError } from "@ApiIntermediary";
import { ClanInviteDataStore } from "@Areas/User/AccountComponents/DataStores/ClanInviteDataStore";
import styles from "@Areas/User/AccountComponents/Privacy.module.scss";
import { useDataStore } from "@bungie/datastore/DataStore";
import { Localizer } from "@bungie/localization";
import { Modal } from "@UIKit/Controls/Modal/Modal";
import { EnumUtils } from "@Utilities/EnumUtils";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Platform, User, Contract } from "@Platform";
import { BungieMembershipType } from "@Enum";

interface ClanInviteCheckboxesProps {
  user: Contract.UserDetail;
}

export const ClanInviteCheckboxes: React.FC<ClanInviteCheckboxesProps> = (
  props
) => {
  const [memberships, setMemberships] = useState<BungieMembershipType[]>([]);
  const clanInviteData = useDataStore(ClanInviteDataStore);

  useEffect(() => {
    Platform.UserService.GetMembershipDataForCurrentUser()
      .then((data: User.UserMembershipData) => {
        const membershipArray = data.destinyMemberships.map(
          (card) => card.membershipType
        );
        setMemberships(membershipArray);

        return membershipArray;
      })
      .then((mts) => {
        const promises: Promise<boolean>[] = [];

        mts.forEach((mt) =>
          promises.push(Platform.GroupV2Service.GetUserClanInviteSetting(mt))
        );

        Promise.all(promises)
          .then((values) => {
            /*values is an array of booleans that we want to match back up with the memberships array from above
						the desired output is the initial state of memberships.*/

            const clanSettings: { [p: string]: boolean } = {};

            values.forEach((bool, i) => (clanSettings[mts[i]] = bool));

            ClanInviteDataStore.actions.updateCurrentSettings(clanSettings);
            ClanInviteDataStore.actions.updateInitialSettings(clanSettings);
          })
          .catch((e) => console.error(e));
      })
      .catch(ConvertToPlatformError)
      .catch((e) => Modal.error(e));
  }, [props.user]);

  return (
    <div className={classNames(styles.clanInvites, styles.twoLine)}>
      {memberships.map((mt, i) => {
        return (
          <div className={classNames(styles.checkbox, styles.noBorder)} key={i}>
            <div>
              {Localizer.Format(Localizer.Clans.AllowClanInvitationsFor, {
                platform:
                  Localizer.Platforms[
                    EnumUtils.getStringValue(mt, BungieMembershipType)
                  ],
              })}
            </div>
            <div>
              <input
                type="checkbox"
                checked={clanInviteData?.clanInviteSettings?.[mt]}
                value={clanInviteData?.clanInviteSettings?.[mt]?.toString()}
                onChange={(e) => {
                  const newSettings = { ...clanInviteData?.clanInviteSettings };
                  newSettings[mt] = e.currentTarget.value === "false";
                  ClanInviteDataStore.actions.updateCurrentSettings(
                    newSettings
                  );
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
