import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getSearchBooks} from '@src/api/book';
import {checkIsEndPage} from '@src/api/queryClient';
import LoadingView from '@src/components/LoadingView';
import NodataView from '@src/components/NodataView';
import SearchHeader from '@src/components/common/header/SearchHeader';
import BookItem from '@src/components/search/BookItem';
import SearchResult from '@src/components/search/Result';
import {SEARCH_PAGE_SIZE, colors} from '@src/constants';
import ErrorScreen from '@src/screens/ErrorScreen';
import {BookItem as BookItemType, SearchStackParamList} from '@src/types';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchMain'>;

const SearchMainScreen = ({navigation}: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [nonce, setNonce] = useState(0); // 검색 버튼을 누른 횟수

  const [isRefreshing, setIsRefreshing] = useState(false);

  const searchQuery = useInfiniteQuery<
    {total: number; books: BookItemType[]},
    {error: string}
  >({
    queryKey: ['/books/search', searchValue, nonce],
    queryFn: async ({pageParam}) =>
      getSearchBooks(searchValue, pageParam as number),
    enabled: nonce !== 0, // 검색 버튼을 누르기 전까지는 쿼리를 실행하지 않음
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPage, _lastPageParam, _allPageParams) => {
      return checkIsEndPage(lastPage.books, allPage, SEARCH_PAGE_SIZE);
    },
  });

  const onChangeText = (text: string) => {
    setInputValue(() => text.replace('\n', '')); // 개행문자 제거
  };

  const onSearch = () => {
    Keyboard.dismiss();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      Alert.alert('검색어를 입력해주세요.');
      return;
    }
    setSearchValue(() => trimmedInput);
    setNonce(pre => pre + 1); //refetch와 동일한 효과
  };

  const handleRefresh = () => {
    setIsRefreshing(() => true);
    onSearch();
    setIsRefreshing(() => false);
  };

  const openDetail = (item: BookItemType) => {
    navigation.navigate('BookDetail', {isbn: item.isbn});
  };

  const onEndReached = () => {
    if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
      searchQuery.fetchNextPage();
    }
  };

  const bookItemList = useMemo(
    () => searchQuery.data?.pages.map(d => d.books).flat() || [],
    [searchQuery.data],
  );

  const total = searchQuery.data?.pages.at(-1)?.total;

  const renderItem = useCallback(
    ({item}: {item: BookItemType}) => {
      return (
        <BookItem
          item={item}
          // onToggleFavorite={onToggleFavorite}
          openDetail={openDetail}
        />
      );
    },
    [openDetail],
  );

  if (searchQuery.error) {
    const error = searchQuery.error as unknown as {error: string};
    return <ErrorScreen errorMessage={error.error} />;
  }

  if (nonce === 0) {
    // 검색하기 전
    return (
      <View style={{flex: 1}}>
        <SearchHeader
          value={inputValue}
          onChangeText={onChangeText}
          onPressBack={() => navigation.goBack()}
          onPressSearch={onSearch}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          multiline={false}
        />
      </View>
    );
  }

  if (searchQuery.isPending) {
    // 검색중
    return (
      <View style={{flex: 1}}>
        <SearchHeader
          aiButtonType="book"
          value={inputValue}
          onChangeText={onChangeText}
          onPressBack={() => navigation.goBack()}
          onPressSearch={onSearch}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          multiline={false}
        />
        <LoadingView />
      </View>
    );
  }

  if (nonce > 0 && bookItemList.length === 0) {
    // 검색 결과가 없을때
    return (
      <View style={{flex: 1}}>
        <SearchHeader
          aiButtonType="book"
          value={inputValue}
          onChangeText={onChangeText}
          onPressBack={() => navigation.goBack()}
          onPressSearch={onSearch}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          multiline={false}
        />
        <NodataView text="검색 결과가 없습니다." />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <FlatList
        ListHeaderComponent={
          <>
            <SearchHeader
              aiButtonType="book"
              value={inputValue}
              onChangeText={onChangeText}
              onPressBack={() => navigation.goBack()}
              onPressSearch={onSearch}
              onSubmitEditing={onSearch}
              returnKeyType="search"
              multiline={false}
            />
            <SearchResult total={total || 0}>{searchValue}</SearchResult>
          </>
        }
        stickyHeaderIndices={[0]}
        keyExtractor={(item, index) => item.isbn.toString() + index}
        renderItem={renderItem}
        data={bookItemList}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        scrollIndicatorInsets={{right: 1}} //ios 스크롤바 버그방지
        overScrollMode="never" // Android
        bounces={false} // iOS
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    backgroundColor: colors.WHITE,
  },
  messageText: {
    fontSize: 17,
    color: colors.GRAY_300,
  },
});

export default SearchMainScreen;
