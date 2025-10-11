import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { API_URL } from '../../../app-config';
import {
  AdHocMenuImage, AuditMenuImage, BmMenuImage, DamageMenuImage, DemandMenuImage,
  DsMenuImage, FdnMenuImage, HistoryMenuImage, NczMenuImage, PackingMenuImage, PickingMenuImage,
  PoCreateMenuImage, ReceivingMenuImage, RtvMenuImage, SearchMenuImage, ShelvingMenuImage,
  SurveyMenuImage, TestMenuImage, TpnMenuImage, WastageMenuImage
} from '../../../assets/images';
import { MenuButton } from '../../../components';
import { useAppContext } from '../../../hooks';

const Home = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { user, logout } = authInfo;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedUser, setUpdatedUser] = useState(null);

  useEffect(() => {
    const fetchUser = async (id, token) => {
      try {
        setLoading(true);
        const response = await fetch(API_URL + "api/users/profile/" + id, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        const data = result.data;
        if (!data.isActive) {
          logout();
        } else {
          const newUser = {
            ...user,
            staffId: data.staffId,
            designation: data.designation,
            roles: data.roles,
            sites: data.sites,
          }
          setUpdatedUser(newUser);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchUser(user.id, user.token);
    }
  }, [logout, user]);

  const menus = [
    {
      name: 'Receiving',
      icon: ReceivingMenuImage,
      screen: 'Receiving',
      permission: 'Receiving',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Shelving',
      icon: ShelvingMenuImage,
      screen: 'Shelving',
      permission: 'shelving-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Create PO',
      icon: PoCreateMenuImage,
      screen: 'CreatePo',
      permission: 'op-create-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Bin Mapping',
      icon: BmMenuImage,
      screen: 'BinMapping',
      permission: 'bin-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    // {
    //   name: 'Stock Movement',
    //   icon: SmMenuImage,
    //   screen: 'StockMovement',
    //   permission: 'stock-access',
    //   types: ['dc'],
    // },
    {
      name: 'Picking',
      icon: PickingMenuImage,
      screen: 'Picking',
      permission: 'picking-access',
      types: ['dc'],
    },
    {
      name: 'Packing',
      icon: PackingMenuImage,
      screen: 'Packing',
      permission: 'packing-access',
      types: ['dc'],
    },
    {
      name: 'Final DN',
      icon: FdnMenuImage,
      screen: 'DnUpdate',
      permission: 'delivery-note-access',
      types: ['dc'],
    },
    // {
    //   name: 'Return',
    //   icon: ReturnMenuImage,
    //   screen: 'Return',
    //   permission: 'return-access',
    //   types: ['outlet', 'darkstore'],
    // },
    {
      name: 'Damage Info',
      icon: DamageMenuImage,
      screen: 'Damage',
      permission: 'damage-access',
      types: ['dc'],
    },
    {
      name: 'DeShelving',
      icon: DsMenuImage,
      screen: 'DeShelving',
      permission: 'deshelving-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Non Conforming',
      icon: NczMenuImage,
      screen: 'NonConforming',
      permission: 'non-conforming-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'RTV',
      icon: RtvMenuImage,
      screen: 'RTV',
      permission: 'rtv-confirm-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'TPN',
      icon: TpnMenuImage,
      screen: 'TPN',
      permission: 'tpn-confirm-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Wastage',
      icon: WastageMenuImage,
      screen: 'Wastage',
      permission: 'wastage-confirm-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Ad-Hoc',
      icon: AdHocMenuImage,
      screen: 'AdHoc',
      permission: 'adhoc-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Search',
      icon: SearchMenuImage,
      screen: 'Search',
      permission: 'search-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Audit',
      icon: AuditMenuImage,
      screen: 'Audit',
      permission: 'audit-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Survey',
      icon: SurveyMenuImage,
      screen: 'Survey',
      permission: 'survey-access',
      types: ['outlet'],
    },
    {
      name: 'Demand',
      icon: DemandMenuImage,
      screen: 'Demand',
      permission: 'demand-access',
      types: ['outlet'],
    },
    {
      name: 'Offer',
      icon: SurveyMenuImage,
      screen: 'Offer',
      permission: 'offer-access',
      types: ['outlet'],
    },
    {
      name: 'History',
      icon: HistoryMenuImage,
      screen: 'History',
      permission: 'history-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
    {
      name: 'Test Screen',
      icon: TestMenuImage,
      screen: 'Test',
      permission: 'test-access',
      types: ['dc', 'outlet', 'darkstore'],
    },
  ];

  const renderItem = useMemo(
    () =>
      ({ item }) =>
        <MenuButton item={item} />,
    [],
  );

  if (loading && !updatedUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  };

  if (error && !updatedUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <Text>Failed to load user: {String(error.message || error)}</Text>
      </View>
    );
  };

  const filterMenus = (newUser, items) => {
    let siteType;
    if (newUser?.active_site?.includes('DK')) {
      siteType = 'dc';
    } else if (newUser?.active_site?.includes('DS')) {
      siteType = 'darkstore';
    } else {
      siteType = 'outlet';
    }

    if (updatedUser?.roles?.includes('Application Admin')) {
      return items.filter(link => link.types.includes(siteType));
    }

    return items.filter(
      link =>
        newUser?.roles?.includes(link.permission) &&
        link.types.includes(siteType),
    );
  };

  const filteredList = filterMenus(updatedUser, menus);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={item => item.name}
        initialNumToRender={12}
        horizontal={false}
        numColumns={3}
        key={`flatList-${3}`}
        ListFooterComponentStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
};

export default Home;
